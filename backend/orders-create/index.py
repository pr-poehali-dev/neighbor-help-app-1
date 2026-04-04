"""
Создание новой заявки на мастера.
POST / — создаёт заказ для авторизованного пользователя
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Authorization",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_user_by_token(cur, token: str):
    cur.execute(
        f"""SELECT u.id, u.name FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.users u ON u.id = s.user_id
            WHERE s.token = %s AND s.expires_at > NOW()""",
        (token,)
    )
    return cur.fetchone()


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    token = (event.get("headers") or {}).get("X-Authorization", "").replace("Bearer ", "").strip()
    if not token:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Необходима авторизация"})}

    body = json.loads(event.get("body") or "{}")
    master_id = body.get("master_id")
    description = (body.get("description") or "").strip()
    scheduled_date = body.get("scheduled_date")
    scheduled_time = body.get("scheduled_time")

    if not master_id or not description:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажите мастера и описание задачи"})}

    conn = get_conn()
    cur = conn.cursor()

    user = get_user_by_token(cur, token)
    if not user:
        cur.close(); conn.close()
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия истекла"})}

    user_id = user[0]

    cur.execute(f"SELECT id, name, specialty, price_from FROM {SCHEMA}.masters WHERE id = %s", (master_id,))
    master = cur.fetchone()
    if not master:
        cur.close(); conn.close()
        return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Мастер не найден"})}

    cur.execute(
        f"""INSERT INTO {SCHEMA}.orders
            (user_id, master_id, service_description, scheduled_date, scheduled_time, status, price_estimate)
            VALUES (%s, %s, %s, %s, %s, 'new', %s)
            RETURNING id, created_at""",
        (user_id, master_id, description, scheduled_date or None, scheduled_time or None, master[3])
    )
    row = cur.fetchone()
    conn.commit()
    cur.close(); conn.close()

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({
            "id": row[0],
            "master_name": master[1],
            "master_specialty": master[2],
            "description": description,
            "scheduled_date": scheduled_date,
            "scheduled_time": scheduled_time,
            "status": "new",
            "created_at": str(row[1])
        })
    }
