"""
Создание новой заявки на мастера.
POST / — создаёт заказ для авторизованного пользователя и отправляет email-уведомление
"""
import json
import os
import smtplib
import psycopg2
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")
NOTIFY_EMAIL = "mvugarv@mail.ru"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Authorization",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_user_by_token(cur, token: str):
    cur.execute(
        f"""SELECT u.id, u.name, u.email FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.users u ON u.id = s.user_id
            WHERE s.token = %s AND s.expires_at > NOW()""",
        (token,)
    )
    return cur.fetchone()


def send_email(order_id, user_name, user_email, master_name, master_specialty,
               description, scheduled_date, scheduled_time):
    smtp_password = os.environ.get("SMTP_PASSWORD", "")
    if not smtp_password:
        return

    date_str = scheduled_date or "не указана"
    time_str = scheduled_time or "не указано"

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #F07820, #D45E10); padding: 24px; border-radius: 16px 16px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 22px;">🏠 Сосед Поможет</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0;">Новая заявка #{order_id}</p>
      </div>
      <div style="background: #FFF8F0; padding: 24px; border-radius: 0 0 16px 16px; border: 1px solid #FFD9A8;">
        <h2 style="color: #7A2A04; margin: 0 0 16px;">Новая заявка от клиента</h2>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #888; font-size: 13px; width: 140px;">Клиент</td>
            <td style="padding: 8px 0; color: #1a1a1a; font-weight: 600;">{user_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888; font-size: 13px;">Email клиента</td>
            <td style="padding: 8px 0; color: #1a1a1a;">{user_email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888; font-size: 13px;">Мастер</td>
            <td style="padding: 8px 0; color: #1a1a1a; font-weight: 600;">{master_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888; font-size: 13px;">Специализация</td>
            <td style="padding: 8px 0; color: #1a1a1a;">{master_specialty}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888; font-size: 13px;">Дата</td>
            <td style="padding: 8px 0; color: #1a1a1a;">{date_str}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888; font-size: 13px;">Время</td>
            <td style="padding: 8px 0; color: #1a1a1a;">{time_str}</td>
          </tr>
        </table>

        <div style="margin-top: 16px; background: white; border-radius: 12px; padding: 16px; border-left: 4px solid #F07820;">
          <p style="color: #888; font-size: 13px; margin: 0 0 6px;">Описание задачи:</p>
          <p style="color: #1a1a1a; margin: 0; font-size: 15px; line-height: 1.5;">{description}</p>
        </div>
      </div>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"🏠 Новая заявка #{order_id} — {master_name}"
    msg["From"] = NOTIFY_EMAIL
    msg["To"] = NOTIFY_EMAIL
    msg.attach(MIMEText(html, "html", "utf-8"))

    with smtplib.SMTP_SSL("smtp.mail.ru", 465) as smtp:
        smtp.login(NOTIFY_EMAIL, smtp_password)
        smtp.sendmail(NOTIFY_EMAIL, NOTIFY_EMAIL, msg.as_string())


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

    user_id, user_name, user_email = user

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

    send_email(
        order_id=row[0],
        user_name=user_name,
        user_email=user_email,
        master_name=master[1],
        master_specialty=master[2],
        description=description,
        scheduled_date=scheduled_date,
        scheduled_time=scheduled_time,
    )

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
