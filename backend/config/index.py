"""
Публичная конфигурация для фронтенда.
GET / — возвращает публичные ключи (Яндекс Карты и др.)
"""
import json
import os

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({
            "yandex_maps_key": os.environ.get("YANDEX_MAPS_KEY", "")
        })
    }
