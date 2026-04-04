"""
Список заказов авторизованного пользователя.
GET / — возвращает историю заказов с данными мастеров
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Authorization",
}

STATUS_LABELS = {
    "new": "Новый",
    "confirmed": "Подтверждён",
    "in_progress": "В работе",
    "done": "Завершён",
    "cancelled": "Отменён",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    token = (event.get("headers") or {}).get("X-Authorization", "").replace("Bearer ", "").strip()
    if not token:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Необходима авторизация"})}

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        f"""SELECT u.id FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.users u ON u.id = s.user_id
            WHERE s.token = %s AND s.expires_at > NOW()""",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        cur.close(); conn.close()
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия истекла"})}

    user_id = row[0]

    cur.execute(
        f"""SELECT o.id, o.service_description, o.scheduled_date, o.scheduled_time,
                   o.status, o.price_estimate, o.created_at,
                   m.name, m.specialty, m.avatar
            FROM {SCHEMA}.orders o
            JOIN {SCHEMA}.masters m ON m.id = o.master_id
            WHERE o.user_id = %s
            ORDER BY o.created_at DESC
            LIMIT 50""",
        (user_id,)
    )
    rows = cur.fetchall()
    cur.close(); conn.close()

    orders = []
    for r in rows:
        orders.append({
            "id": r[0],
            "description": r[1],
            "scheduled_date": str(r[2]) if r[2] else None,
            "scheduled_time": r[3],
            "status": r[4],
            "status_label": STATUS_LABELS.get(r[4], r[4]),
            "price_estimate": r[5],
            "created_at": str(r[6]),
            "master_name": r[7],
            "master_specialty": r[8],
            "master_avatar": r[9],
        })

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"orders": orders})
    }
