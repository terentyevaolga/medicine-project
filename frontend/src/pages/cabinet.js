import Head from "next/head";
import styles from '../styles/Account.module.css';
import { GlobalSearch, SideMenu } from "../components";
import '@fontsource-variable/inter';
import { SimpleGrid, Image } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from '../../apiConfig.js';
import { useRouter } from "next/router";

export default function Cabinet() {

  const router = useRouter();
  const [data, setData] = useState([]);
  const [dataTest, setDataTest] = useState([]);
  const [dataMaterials, setDataMaterials] = useState([]);

  useEffect(() => {
    load()
  }, []);

  function load() {
    axios.get(`${API_BASE_URL}users/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        setData(res.data);
      })
      .catch((e) => console.log(e));

    axios.get(`${API_BASE_URL}courses/tests_results`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        console.log(res.data);
        setDataTest(res.data);
      })

    axios.get(`${API_BASE_URL}courses/priority_recs`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        console.log(res.data);
        setDataMaterials(res.data);
      })
  };

  function download(id, name) {
    axios.get(`${API_BASE_URL}courses/file_sources/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      responseType: 'blob'
    }).then((res) => {
      const blob = new Blob([res.data]);
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `${name}.` + res.headers['content-type'].split('/').at(-1);
      link.click();
    })
  };


  return <>
    <Head>
      <title>Личный кабинет</title>
      <meta name="description" content="" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <main>
      <SideMenu />
      <GlobalSearch />
      <div className={styles.container}>
        <p className={styles.title}>Личный кабинет</p>
        <div className={styles.data}>
          <div className={styles.data_info}>
            <div className={styles.data_infoUser}>
              <div className={styles.blockNameMail}>
                <p className={styles.name}>{data.fido}</p>
                <p className={styles.phone}>{data.email}</p>
              </div>
              <div style={{ gap: '10px', display: 'flex', flexDirection: 'column' }} >
                <button className={styles.edit} onClick={() => router.push('/edit')}>Редактировать</button>
                <div className={styles.tgButton} onClick={() => router.push('https://t.me/+FxBpZK6rYOUzYjJi')}>
                  <Image src='./tg.svg' w='40px' h='40px' />
                  <p>Информационный канал</p>
                </div>
              </div>
            </div>
            <div className={styles.data_infoTests}>
              <p className={styles.historyTestsTitle}>История тестирования</p>
              <div className={styles.testResultBlock} >
                {dataTest.length > 0
                  ? dataTest.map((x, i) => <p key={i} className={styles.testResult} >{x.date} {x.test_title?.split('.')[1].toLowerCase()} - {x.score}/{x.questions_number}</p>)
                  : <p className={styles.testResult}>У вас нет пройденных тестов</p>}
              </div>
            </div>
          </div>
          {dataTest.length > 0
            ? <div className={styles.data_material}>
              <p className={styles.data_materialTitle}>Подборка учебных материалов по результатам пройденных тестирований</p>
              <div className={styles.materialBlock}>
                <p className={styles.materialSubtitle}>Видеолекции</p>
                <div className={styles.materialContainer}>
                  <SimpleGrid columns={2} gap='10px'>
                    {dataMaterials.map((y, n) => y.lections.map((x, i) => n < 1 && i < 2 && <iframe key={i}
                      id="player" type="text/html" width="279" height="163" frameBorder="0"
                      src={`https://youtube.com/embed/${x.link.split('v=')[1].split('&')[0]}`}>
                    </iframe>))}
                  </SimpleGrid>
                </div>
              </div>
              <div className={styles.materialBlock}>
                <p className={styles.materialSubtitle}>Методические материалы</p>
                <div className={styles.materialContainer}>
                  <SimpleGrid columns={2} gap='10px'>
                    {dataMaterials.map((y, n) => y.file_sources.map((x, i) => n < 6 && x.type === 'manual' && <div key={i} className={styles.materialBoxMetod} onClick={() => download(x.uuid, x.title)}>
                      <p className={styles.materialText}>{x.title}</p>
                    </div>))}
                  </SimpleGrid>
                </div>
              </div>
              <div className={styles.materialBlock}>
                <p className={styles.materialSubtitle}>Конспекты</p>
                <div className={styles.materialContainer}>
                  <SimpleGrid columns={2} gap='10px'>
                    {dataMaterials.map((y, n) => y.file_sources.map((x, i) => n < 6 && x.type === 'summary' && <div key={i} className={styles.materialBoxMetod} onClick={() => download(x.uuid, x.title)}>
                      <p className={styles.materialText}>{x.title}</p>
                    </div>))}
                  </SimpleGrid>
                </div>
              </div>
            </div>
            : <p className={styles.testResult}>У вас нет советуемых материалов для улучшения уровня знаний, так как у вас нет пройденных тестов</p>}
        </div>
      </div>
    </main>
  </>
}
