FROM python:3.11.6-slim 

RUN apt-get update && apt-get install -y locales

# Locale
RUN sed -i -e \
  's/# ru_RU.UTF-8 UTF-8/ru_RU.UTF-8 UTF-8/' /etc/locale.gen \
   && locale-gen

ENV LANG ru_RU.UTF-8
ENV LANGUAGE ru_RU:ru
ENV LC_LANG ru_RU.UTF-8
ENV LC_ALL ru_RU.UTF-8

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt
COPY ./.env /code/.env

COPY ./app /code/app
COPY ./main.py /code/main.py

RUN mkdir -p data/files
COPY ./data/result.json /code/data/result.json
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
# RUN mkdir app/logs && touch app/logs/debug_file.log
# RUN mkdir migrations && mkdir migrations/models

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "81"]
