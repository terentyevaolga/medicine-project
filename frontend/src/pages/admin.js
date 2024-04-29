import Head from "next/head";
import styles from '../styles/UsersAdmin.module.css';
import { AdminArticle, AdminLections, SideMenu, UsersAdmin } from "../components";
import { useRouter } from "next/router";
import { AdminMetodich } from "@/components/AdminMetodich";
import { AdminSummary } from "@/components/AdminSummary";

export default function Admin() {

    const router = useRouter();
    const { type } = router.query;

    function pages(x) {
        switch (x) {
            case 'users':
                return <UsersAdmin />
            case 'Лекции':
                return <AdminLections />
            case 'Методички':
                return <AdminMetodich />
            case 'Конспекты':
                return <AdminSummary />
            default:
                return <AdminArticle />
        }
    }

    return <>
        <Head>
            <title>Админ панель</title>
            <meta name="description" content="" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main>
            <SideMenu />
            <div className={styles.main}>
                {pages(type)}
            </div>
        </main>
    </>
}