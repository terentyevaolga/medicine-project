import Head from "next/head";
import styles from '../styles/Course.module.css';
import { GlobalSearch, SideMenu } from "../components";
import '@fontsource-variable/inter';
import { useRouter } from "next/router";
import { Menu, MenuButton, MenuList, MenuItem, SimpleGrid, Spinner, useToast, Image, useDisclosure, Modal, ModalBody, ModalContent, ModalOverlay, Button } from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import API_BASE_URL from '../../apiConfig.js';

export default function Course() {

  const router = useRouter();
  const previousUrlRef = useRef(router.asPath);
  const { number, signUp } = router.query;
  const { onOpen, isOpen, onClose } = useDisclosure();

  const [subject, setSubject] = useState('');
  const [subjectsType, setSubjectsType] = useState([]);
  const [subjectType, setSubjectType] = useState('');
  const [listMenu, setListMenu] = useState([]);

  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    load();
    const handleRouteChange = (url) => {
      if (url !== previousUrlRef.current) {
        load();
        selectSubject('');
        previousUrlRef.current = url;
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  function load() {
    if (!localStorage.getItem('token')) return router.push('/')
    setLoading(true);
    if (signUp) setTimeout(() => { onOpen() }, 3000)
    axios.get(`${API_BASE_URL}courses/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        setListMenu(res.data);
        setLoading(false);
      })
      .catch((e) => console.log(e));
  };

  function selectSubject(sub) {
    setLoading(true);
    setSubject(sub);
    axios.get(`${API_BASE_URL}courses/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        res.data[number - 1].themes.map(x => {
          if (x.title === sub) {
            setSubjectsType(x.parts);
            setSubjectType(x.parts[0].title)
          }
        });
        setLoading(false);
      })
      .catch((e) => console.log(e));
  };

  function download(id, name) {
    setLoading(true);
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
      setLoading(false);
    })
  };

  return <>
    <Head>
      <title>Курсы</title>
      <meta name="description" content="" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <main>
      <SideMenu />
      <GlobalSearch />
      <div className={styles.main}>
        <p className={styles.title}>Все материалы для студентов <span style={{ color: '#07C88E' }} >{number} курса</span></p>
        <Menu>
          <MenuButton className={styles.menuButton}>
            <div className={styles.menuButtonBlock}>
              <p className={styles.menuButtonText}>{subject !== '' ? subject : 'Выберите предмет'}</p>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M18.5303 8.46967C18.8232 8.76256 18.8232 9.23744 18.5303 9.53033L12.5303 15.5303C12.2374 15.8232 11.7626 15.8232 11.4697 15.5303L5.46967 9.53033C5.17678 9.23744 5.17678 8.76256 5.46967 8.46967C5.76256 8.17678 6.23744 8.17678 6.53033 8.46967L12 13.9393L17.4697 8.46967C17.7626 8.17678 18.2374 8.17678 18.5303 8.46967Z" fill="#000B26" fillOpacity="0.72" />
              </svg>
            </div>
          </MenuButton>
          <MenuList className={styles.menuList} autoFocus={false} >
            {!loading && listMenu[Number(number) - 1]?.themes.map((x, i) => <MenuItem key={i} onClick={() => selectSubject(x.title)} className={styles.menuItem}>{x.title}</MenuItem>)}
          </MenuList>
        </Menu>
        {subject !== '' && <div className={styles.container}>
          <div className={styles.navigationBlock}>
            <p className={styles.navigationTitle}>{subject}</p>
            <div className={styles.navigaton}>
              {!loading && subjectsType.map((x, i) => <div key={i} onClick={() => setSubjectType(x.title)} className={`${styles.navigationItem} ${x.title === subjectType && styles.navigationItemCheck}`} >
                <p>{x.title.split('.')[1]}</p>
              </div>)}
            </div>
          </div>
          {!loading && <div className={styles.info}>
            <div className={styles.testBlock}>
              <p className={styles.testTitle}>Проверьте свои знания по выбранной дисциплине!</p>
              <button className={styles.testButton} onClick={() => subjectType !== '' ? router.push(`/quiz?quiz=${subjectType}&course=${number}&subject=${subject}`) : toast({
                title: 'Ошибка', description: "Вы не выбрали тему", status: 'error', duration: 4000, isClosable: true, position: 'bottom-right'
              })} >Пройдите тест</button>
            </div>
            <div className={styles.materialsBlock}>
              <div className={styles.materialBlock}>
                <p className={styles.materialSubtitle}>Видеолекции</p>
                <div className={styles.materialContainer}>
                  <SimpleGrid columns={3} gap='30px'>
                    {subjectsType.map(x => x.title === subjectType && x.sources.map((y, i) => <iframe
                      key={i}
                      id="player" type="text/html" width="279" height="163" frameBorder="0"
                      src={`https://youtube.com/embed/${y.link.split('v=')[1]?.split('&')[0]}`}>
                    </iframe>
                    ))}
                  </SimpleGrid>
                </div>
              </div>
              <div className={styles.materialBlock}>
                <p className={styles.materialSubtitle}>Методические материалы</p>
                <div className={styles.materialContainer}>
                  <SimpleGrid columns={3} gap='30px'>
                    {subjectsType.map(x => x.title === subjectType
                      && x.file_sources.map((y, i) => y.type === 'manual' && <div key={i} className={styles.materialBoxMetod} onClick={() => download(y.uuid, y.title)}>
                        <p className={styles.materialText}>{y.title}</p>
                      </div>))}
                  </SimpleGrid>
                </div>
              </div>
              <div className={styles.materialBlock}>
                <p className={styles.materialSubtitle}>Конспекты</p>
                <div className={styles.materialContainer}>
                  <SimpleGrid columns={3} gap='30px'>
                    {subjectsType.map(x => x.title === subjectType
                      && x.file_sources.map((y, i) => y.type === 'summary' && <div key={x} className={styles.materialBoxMetod} onClick={() => download(y.uuid, y.title)} >
                        <p className={styles.materialText}>{y.title}</p>
                      </div>))}
                  </SimpleGrid>
                </div>
              </div>
            </div>
          </div>}
        </div>}
        <Spinner display={loading ? 'block' : 'none'} />
      </div>
      <Modal isOpen={isOpen} onClose={onClose} autoFocus={false} isCentered>
        <ModalOverlay />
        <ModalContent bg='none' >
          <ModalBody>
            <div className={styles.modalSignIn}>
              <div className={styles.modal_headerBlock}>
                <p className={styles.modal_title} >Подпишитесь на наш телеграмм-канал, чтобы получать уведомления о новых учебных материалах первым</p>
                <div onClick={onClose} className={styles.modal_close} >
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M24.7071 8.70711C25.0976 8.31658 25.0976 7.68342 24.7071 7.29289C24.3166 6.90237 23.6834 6.90237 23.2929 7.29289L16 14.5858L8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L14.5858 16L7.29289 23.2929C6.90237 23.6834 6.90237 24.3166 7.29289 24.7071C7.68342 25.0976 8.31658 25.0976 8.70711 24.7071L16 17.4142L23.2929 24.7071C23.6834 25.0976 24.3166 25.0976 24.7071 24.7071C25.0976 24.3166 25.0976 23.6834 24.7071 23.2929L17.4142 16L24.7071 8.70711Z" fill="#000B26" fillOpacity="0.72" />
                  </svg>
                </div>
              </div>
              <div className={styles.modal_body}>
                <div className={styles.tgButton} onClick={() => router.push('https://t.me/+FxBpZK6rYOUzYjJi')}>
                  <Image src='./tg.svg' w='40px' h='40px' />
                  <p>Перейти</p>
                </div>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </main>
  </>
}
