def default_bot_message_text(material_type: str, id: str) -> str:
    if material_type in directions: 
        link = f"{base_url}/{material_type}?index={id}"
        return f"""📚 Новый учебный материал добавлен на наш сайт!
Поспешите изучить его для расширения своих знаний и навыков.
Ссылка: {link}"""
    else: 
        return f"""📚 Новый учебный материал добавлен на наш сайт!
Поспешите изучить его для расширения своих знаний и навыков."""


base_url = "https://medicine.zvir.tech"
directions = ["lectures", "manuals", "synopsis", "articles"]