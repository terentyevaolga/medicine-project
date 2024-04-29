def check_answer(test_questions: list, answer: dict):
    for question in test_questions:
            if question["text"] == answer["text"]:
                return len(set(question["right_answers"])) == len(set(answer["answers"])) and set(question["right_answers"]) == set(answer["answers"])
