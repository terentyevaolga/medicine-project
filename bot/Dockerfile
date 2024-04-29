FROM python:3.11-slim

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt
COPY ./.env /code/.env

RUN python3.11 -m pip install --upgrade pip
RUN python3.11 -m pip install -r /code/requirements.txt

COPY ./ /code/

CMD ["python3.11", "-u", "main.py"]
