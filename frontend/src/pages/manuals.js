import Head from "next/head";
import styles from '../styles/MaterialsPage.module.css';
import { SideMenu, GlobalSearch } from "../components";
import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../apiConfig";
import { Button, SimpleGrid, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function Manuals() {

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
        axios.get(`${API_BASE_URL}courses/file_sources_lite`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then((res) => {
                console.log(res.data);
                setData(res.data);
                setLoading(false);
                if (res.data[course].manuals.length < 12) setButtonDisplay(false);
            })
            .catch((e) => {
                console.log(e);
                setLoading(false);
            })
    };

    function arrayLength() {
        setNowLength(nowLength + 12);
        if (nowLength > data[course].manuals.length) setButtonDisplay(false);
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
            <title>Методички</title>
            <meta name="description" content="" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main>
            <SideMenu />
            <GlobalSearch />
            <div className={styles.main}>
                <p className={styles.title}>Методички</p>
                {!index
                    ? <>
                        <div className={styles.navigationBlock} >
                            {[0, 1, 2, 3, 4].map(x => <div key={x} onClick={() => setCourse(x)} className={`${styles.navigationItem} ${x === course && styles.navigationItemCheck}`} >
                                <p>{x + 1} курс</p>
                            </div>)}
                        </div>
                        <SimpleGrid width='100%' columns={3} gap='10px'>
                            {data.length > 0 && data[course].manuals.length > 0
                                ? data[course].manuals.map((x, i) => i < nowLength && <div key={i} className={styles.materialBoxMetod} onClick={() => download(x.uuid, x.title)}>
                                    <p className={styles.materialText}>{x.title}</p>
                                </div>)
                                : !loading && <p>Методические данные отсутствуют</p>}
                        </SimpleGrid>
                        <div className={styles.buttonBlock} >
                            <Button onClick={() => arrayLength()} backgroundColor='#07C88E' borderRadius='8px' height='56px' width='max-content' color='white' _hover={{}} fontWeight={500} display={buttonDisplay && !loading ? 'block' : 'none'} >Ещё методички</Button>
                        </div>
                    </>
                    : <>
                        {data[course]?.manuals.map((x, i) => index === x.uuid && <div key={i} className={styles.materialBoxMetod} onClick={() => download(x.uuid, x.title)}>
                            <p className={styles.materialText}>{x.title}</p>
                        </div>)}
                        <div className={styles.buttonBlock} >
                            <Button onClick={() => router.push('/manuals')} backgroundColor='#07C88E' borderRadius='8px' height='56px' width='max-content' color='white' _hover={{}} fontWeight={500}>Посмотреть все методички</Button>
                        </div>
                    </>}
                <Spinner display={loading ? 'block' : 'none'} />
            </div>
        </main>
    </>
}