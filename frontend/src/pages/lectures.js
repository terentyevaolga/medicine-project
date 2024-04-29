import Head from "next/head";
import styles from '../styles/MaterialsPage.module.css';
import { SideMenu, GlobalSearch } from "../components";
import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../apiConfig";
import { Button, SimpleGrid, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function Lectures() {

    const router = useRouter();
    const { index } = router.query;
    const [loading, setLoading] = useState(false);
    const [buttonDisplay, setButtonDisplay] = useState(true);    

    const [course, setCourse] = useState(0);
    const [data, setData] = useState([]);
    const [nowLength, setNowLength] = useState(12);
    

    useEffect(() => {
        load();
    }, []);

    function load() {
        setLoading(true);
        axios.get(`${API_BASE_URL}courses/video_materials_lite/`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then((res) => {
                setData(res.data);
                setLoading(false);
            })
            .catch((e) => {
                console.log(e);
                setLoading(false);
            })
    };

    function arrayLength() {
        setNowLength(nowLength + 12);
        if (nowLength > data[course].lections.length) setButtonDisplay(false);
    };

    return <>
        <Head>
            <title>Лекции</title>
            <meta name="description" content="" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main>
            <SideMenu />
            <GlobalSearch />
            <div className={styles.main}>
                <p className={styles.title}>Лекции</p>
                {!index && <div className={styles.navigationBlock} >
                    {[0, 1, 2, 3, 4].map(x => <div key={x} onClick={() => setCourse(x)} className={`${styles.navigationItem} ${x === course && styles.navigationItemCheck}`} >
                        <p>{x + 1} курс</p>
                    </div>)}
                </div>}
                {!index && <Spinner display={loading ? 'block' : 'none'} />}
                {!index
                    ? <> <SimpleGrid width='100%' columns={3} gap='10px'>
                        {data.length > 0 && data[course].lections.map((x, i) => i < nowLength && <iframe key={i}
                            id="player" type="text/html" width="279" height="163" frameBorder="0"
                            src={`https://youtube.com/embed/${x.link.split('v=')[1].split('&')[0]}`}>
                        </iframe>)}
                    </SimpleGrid>
                        <div className={styles.buttonBlock} >
                            <Button onClick={() => arrayLength()} backgroundColor='#07C88E' borderRadius='8px' height='56px' width='max-content' color='white' _hover={{}} fontWeight={500} display={buttonDisplay && !loading ? 'block' : 'none'} >Ещё видео</Button>
                        </div>
                    </>
                    : data.length > 0 && data[course].lections.map((x, i) => x.uuid === index && <>
                        <iframe key={i}
                            id="player" type="text/html" width="773" height="489" frameBorder="0"
                            src={`https://youtube.com/embed/${x.link.split('v=')[1].split('&')[0]}`}>
                        </iframe>
                        <div className={styles.buttonBlock} >
                            <Button onClick={() => router.push('/lectures')} backgroundColor='#07C88E' borderRadius='8px' height='56px' width='max-content' color='white' _hover={{}} fontWeight={500}>Посмотреть все лекции</Button>
                        </div>
                    </>)}
            </div>
        </main>
    </>
}