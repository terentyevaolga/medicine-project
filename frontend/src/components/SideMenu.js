import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalOverlay, useDisclosure, useToast } from "@chakra-ui/react";
import axios from "axios";
import API_BASE_URL from '../../apiConfig.js';

const linksMaterial = [
    { name: 'Лекции', link: '/lectures' },
    { name: 'Методички', link: '/manuals' },
    { name: 'Конспекты', link: '/synopsis' },
    { name: 'Статьи', link: '/articles' }
];

const accountPages = ['/cabinet', '/course', '/edit', '/quiz', '/admin', '/result', '/lectures', '/manuals', '/synopsis', '/articles'];

export function SideMenu() {

    const [token, setToken] = useState('');
    const router = useRouter();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [state, setState] = useState('signIn');
    const [loading, setLoading] = useState(false);    
    const [data, setData] = useState([]);

    const { number, type } = router.query;

    useEffect(() => {
        setToken(localStorage.getItem('token'));
        load();
    }, []);

    function load() {
        if (router.pathname === '/') return ""
        else if (!localStorage.getItem('token')) router.push('/');
        axios.get(`${API_BASE_URL}users/me`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then((res) => {               
                setData(res.data);
                if (res.data.is_admin) return router.push('/admin?type=users');
            })
            .catch((e) => console.log(e));
    }

    const [name, setName] = useState('');
    const [mail, setMail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [code, setCode] = useState('');

    const regexMail = /^[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}$/i;

    let params = new URLSearchParams();
    params.append('username', mail);
    params.append('password', password);

    function signIn() {
        setLoading(true);
        if (regexMail.test(mail) && password.length > 0) {
            axios.post(`${API_BASE_URL}auth/login/access-token`, params)
                .then((res) => {
                    console.log(res.data);
                    localStorage.setItem('token', res.data.access_token);
                    router.push('/course?number=1');
                })
                .catch((e) => {
                    console.log(e);
                    if (e?.response.status === 404) toast({
                        title: 'Ошибка', description: "Пользователь не найден", status: 'error', duration: 4000, isClosable: true, position: 'bottom-right'
                    });
                    if (e?.response.status === 400) toast({
                        title: 'Ошибка', description: "Неверный пароль", status: 'error', duration: 4000, isClosable: true, position: 'bottom-right'
                    });
                    setLoading(false);
                })
        } else {
            if (!regexMail.test(mail)) toast({
                title: 'Ошибка', description: "Вы некорректно ввели почту", status: 'error', duration: 4000, isClosable: true, position: 'bottom-right'
            });
            if (password.length === 0) toast({
                title: 'Ошибка', description: "Вы некорректно ввели пароль", status: 'error', duration: 4000, isClosable: true, position: 'bottom-right'
            });
            setLoading(false);
        }
    };

    function signUp() {
        setLoading(true);
        if (regexMail.test(mail) && password.length > 0 && name.length > 0 && password == passwordConfirm) {
            axios.post(`${API_BASE_URL}users/`, { email: mail, password, fido: name })
                .then((res) => {
                    setLoading(false);
                    console.log(res.data);
                    localStorage.setItem('token', res.data.access_token);
                    setState('code');
                })
                .catch((e) => {
                    console.log(e);
                    setLoading(false);
                })
        } else {
            if (!regexMail.test(mail)) toast({
                title: 'Ошибка', description: "Вы некорректно ввели почту", status: 'error', duration: 4000, isClosable: true, position: 'bottom-right'
            })
            if (password.length === 0) toast({
                title: 'Ошибка', description: "Вы некорректно ввели пароль", status: 'error', duration: 4000, isClosable: true, position: 'bottom-right'
            })
            if (name.length === 0) toast({
                title: 'Ошибка', description: "Вы некорректно ввели имя", status: 'error', duration: 4000, isClosable: true, position: 'bottom-right'
            })
            if (password !== passwordConfirm) toast({
                title: 'Ошибка', description: "Пароли не совпадают", status: 'error', duration: 4000, isClosable: true, position: 'bottom-right'
            })
            setLoading(false);
        }
    };

    function codeCheck() {
        setLoading(true);
        if (code.length === 6) {
            axios.post(`${API_BASE_URL}users/me/confirm?code=${code}`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then((res) => {                    
                    router.push('/course?number=1&signUp=true');
                })
        } else {
            if (code.length !== 6) toast({
                title: 'Ошибка', description: "Код введён неверно", status: 'error', duration: 4000, isClosable: true, position: 'bottom-right'
            })
        }
    };

    function logOut() {
        localStorage.removeItem('token');
        router.push('/');
    }

    return <div className={`${styles.container} ${accountPages.includes(router.pathname) && styles.containerLine} `} >
        <p className={styles.logo}>Медицина</p>
        <div className={styles.blockMaterial}>
            {data.is_admin && <button onClick={() => router.push('/admin?type=users')} className={`${styles.cources_title} ${router.query.type === 'users' && styles.greenText}`} >Пользователи</button>}
            {!data.is_admin && <div className={styles.cources}>
                <p className={`${styles.cources_title} ${router.pathname === '/course' && styles.greenUnderline}`}>Курсы</p>
                <div className={styles.cources_itemList}>
                    {[1, 2, 3, 4, 5].map(x =>
                        <p key={x} onClick={() => token && router.push(`/course?number=${x}`)} className={`${token ? styles.cources_item : styles.cources_itemMainPage} ${x == number && styles.greenText}`}>{x} курс</p>)}
                </div>
            </div>}
            <div className={styles.cources}>
                <p className={`${styles.cources_title} ${type === 'educationalMaterials' && styles.greenUnderline}`}>Учебные материалы</p>
                <div className={styles.cources_itemList}>
                    {linksMaterial.map((x, i) =>
                        <p key={i} onClick={() => token && !data.is_admin ? router.push(`/${x.link}`) : router.push(`/admin?type=${x.name}`)} className={`${token ? styles.cources_item : styles.cources_itemMainPage} ${x.link === router.pathname && styles.greenUnderline}`}><span style={{ color: data.is_admin && type === x.name && '#07C88E' }} >{x.name}</span></p>)}
                </div>
            </div>
        </div>
        <div className={styles.authBlock}>
            {accountPages.includes(router.pathname)
                ? <>
                    {!data.is_admin && <div className={styles.account} onClick={() => router.push('/cabinet')} >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M6.21967 0.46967C6.51256 0.176777 6.98744 0.176777 7.28033 0.46967L13.2803 6.46967C13.5732 6.76256 13.5732 7.23744 13.2803 7.53033L7.28033 13.5303C6.98744 13.8232 6.51256 13.8232 6.21967 13.5303C5.92678 13.2374 5.92678 12.7626 6.21967 12.4697L10.9393 7.75H0.75C0.335786 7.75 0 7.41421 0 7C0 6.58579 0.335786 6.25 0.75 6.25H10.9393L6.21967 1.53033C5.92678 1.23744 5.92678 0.762563 6.21967 0.46967Z" fill="#000B26" fillOpacity="0.72" />
                        </svg>
                        <p className={styles.account_button} style={{ color: router.pathname === '/cabinet' && '#07C88E' }} >Личный кабинет</p>
                    </div>}
                    <div className={styles.logOutBlock} onClick={logOut} >
                        <div className={styles.logOutIcon}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M6.21967 0.46967C6.51256 0.176777 6.98744 0.176777 7.28033 0.46967L13.2803 6.46967C13.5732 6.76256 13.5732 7.23744 13.2803 7.53033L7.28033 13.5303C6.98744 13.8232 6.51256 13.8232 6.21967 13.5303C5.92678 13.2374 5.92678 12.7626 6.21967 12.4697L10.9393 7.75H0.75C0.335786 7.75 0 7.41421 0 7C0 6.58579 0.335786 6.25 0.75 6.25H10.9393L6.21967 1.53033C5.92678 1.23744 5.92678 0.762563 6.21967 0.46967Z" fill="#000B26" fillOpacity="0.72" />
                            </svg>
                        </div>
                        <p className={styles.cources_item}>Выйти</p>
                    </div>
                </>
                : router.pathname === '/' && <div className={styles.signIn} onClick={() => { setState('signIn'); onOpen() }} >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M4.75 0.25C2.67893 0.25 1 1.92893 1 4V16C1 18.0711 2.67893 19.75 4.75 19.75H10.75C12.8211 19.75 14.5 18.0711 14.5 16V15C14.5 14.5858 14.1642 14.25 13.75 14.25C13.3358 14.25 13 14.5858 13 15V16C13 17.2426 11.9926 18.25 10.75 18.25H4.75C3.50736 18.25 2.5 17.2426 2.5 16V4C2.5 2.75736 3.50736 1.75 4.75 1.75H10.75C11.9926 1.75 13 2.75736 13 4V5C13 5.41421 13.3358 5.75 13.75 5.75C14.1642 5.75 14.5 5.41421 14.5 5V4C14.5 1.92893 12.8211 0.25 10.75 0.25H4.75ZM9.78033 7.53033C10.0732 7.23744 10.0732 6.76256 9.78033 6.46967C9.48744 6.17678 9.01256 6.17678 8.71967 6.46967L5.71967 9.46967C5.42678 9.76256 5.42678 10.2374 5.71967 10.5303L8.71967 13.5303C9.01256 13.8232 9.48744 13.8232 9.78033 13.5303C10.0732 13.2374 10.0732 12.7626 9.78033 12.4697L8.06066 10.75H18.25C18.6642 10.75 19 10.4142 19 10C19 9.58579 18.6642 9.25 18.25 9.25H8.06066L9.78033 7.53033Z" fill="#000B26" fillOpacity="0.72" />
                    </svg>
                    <p className={styles.signin_button} >Войти</p>
                </div>
            }
        </div>
        <Modal isOpen={isOpen} onClose={onClose} autoFocus={false} isCentered>
            <ModalOverlay />
            <ModalContent bg='none' >
                <ModalBody>
                    {state === 'signIn'
                        ? <div className={styles.modalSignIn}>
                            <div className={styles.modal_headerBlock}>
                                <p className={styles.modal_title} >Вход</p>
                                <div onClick={onClose} className={styles.modal_close} >
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M24.7071 8.70711C25.0976 8.31658 25.0976 7.68342 24.7071 7.29289C24.3166 6.90237 23.6834 6.90237 23.2929 7.29289L16 14.5858L8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L14.5858 16L7.29289 23.2929C6.90237 23.6834 6.90237 24.3166 7.29289 24.7071C7.68342 25.0976 8.31658 25.0976 8.70711 24.7071L16 17.4142L23.2929 24.7071C23.6834 25.0976 24.3166 25.0976 24.7071 24.7071C25.0976 24.3166 25.0976 23.6834 24.7071 23.2929L17.4142 16L24.7071 8.70711Z" fill="#000B26" fillOpacity="0.72" />
                                    </svg>
                                </div>
                            </div>
                            <div className={styles.modal_body}>
                                <div className={styles.modal_inputBlock}>
                                    <input placeholder="Почта" onChange={(e) => setMail(e.target.value)} className={styles.modal_input} />
                                    <input placeholder="Пароль" type="password" onChange={(e) => setPassword(e.target.value)} className={styles.modal_input} />
                                </div>
                                <div className={styles.modal_buttonBlock}>
                                    <Button isLoading={loading} backgroundColor='#07C88E' borderRadius='8px' height='56px' width='100%' color='white' _hover={{}} fontWeight={500} onClick={signIn} >Войти</Button>
                                    <p className={styles.modal_registerText}>Еще нет аккаунта? <span className={styles.modal_signUp} onClick={() => setState('signUp')} >Зарегистрироваться</span></p>
                                </div>
                            </div>
                        </div>
                        : state === 'signUp'
                            ? <div className={styles.modalSignUp}>
                                <div className={styles.modal_headerBlock}>
                                    <p className={styles.modal_title} >Регистрация</p>
                                    <div onClick={onClose} className={styles.modal_close} >
                                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M24.7071 8.70711C25.0976 8.31658 25.0976 7.68342 24.7071 7.29289C24.3166 6.90237 23.6834 6.90237 23.2929 7.29289L16 14.5858L8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L14.5858 16L7.29289 23.2929C6.90237 23.6834 6.90237 24.3166 7.29289 24.7071C7.68342 25.0976 8.31658 25.0976 8.70711 24.7071L16 17.4142L23.2929 24.7071C23.6834 25.0976 24.3166 25.0976 24.7071 24.7071C25.0976 24.3166 25.0976 23.6834 24.7071 23.2929L17.4142 16L24.7071 8.70711Z" fill="#000B26" fillOpacity="0.72" />
                                        </svg>
                                    </div>
                                </div>
                                <div className={styles.modal_body}>
                                    <div className={styles.modal_inputBlock}>
                                        <input placeholder="Фамилия и Имя" value={name} onChange={(e) => setName(e.target.value)} className={styles.modal_input} />
                                        <input placeholder="Почта" value={mail} onChange={(e) => setMail(e.target.value)} className={styles.modal_input} />
                                        <input placeholder="Пароль" value={password} type="password" onChange={(e) => setPassword(e.target.value)} className={styles.modal_input} />
                                        <input placeholder="Подтверждения пароля" value={passwordConfirm} type="password" onChange={(e) => setPasswordConfirm(e.target.value)} className={styles.modal_input} />
                                    </div>
                                    <div className={styles.modal_buttonBlock}>
                                        <Button backgroundColor='#07C88E' borderRadius='8px' height='56px' width='100%' isLoading={loading} color='white' _hover={{}} fontWeight={500} onClick={signUp} >Зарегистрироваться</Button>
                                        <p className={styles.modal_registerText}>Уже есть аккаунт? <span className={styles.modal_signUp} onClick={() => setState('signIn')} >Войти</span></p>
                                    </div>
                                </div>
                            </div>
                            : <div className={styles.modalCode}>
                                <div className={styles.modal_headerBlock}>
                                    <p className={styles.modal_title} >Ввести код</p>
                                    <div onClick={onClose} className={styles.modal_close} >
                                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M24.7071 8.70711C25.0976 8.31658 25.0976 7.68342 24.7071 7.29289C24.3166 6.90237 23.6834 6.90237 23.2929 7.29289L16 14.5858L8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L14.5858 16L7.29289 23.2929C6.90237 23.6834 6.90237 24.3166 7.29289 24.7071C7.68342 25.0976 8.31658 25.0976 8.70711 24.7071L16 17.4142L23.2929 24.7071C23.6834 25.0976 24.3166 25.0976 24.7071 24.7071C25.0976 24.3166 25.0976 23.6834 24.7071 23.2929L17.4142 16L24.7071 8.70711Z" fill="#000B26" fillOpacity="0.72" />
                                        </svg>
                                    </div>
                                </div>
                                <div className={styles.modal_body}>
                                    <div className={styles.modal_inputBlock}>
                                        <p className={styles.modal_registerText}>Введите код отправленный вам на почту<br /><span className={styles.modal_signUp}>{mail}</span></p>
                                        <input value={code} placeholder="Код" onChange={(e) => setCode(e.target.value)} className={styles.modal_input} />
                                    </div>
                                    <div className={styles.modal_buttonBlock}>
                                        <Button backgroundColor='#07C88E' borderRadius='8px' height='56px' width='100%' color='white' isLoading={loading} _hover={{}} fontWeight={500} onClick={codeCheck} >Отправить</Button>
                                    </div>
                                </div>
                            </div>}
                </ModalBody>
            </ModalContent>
        </Modal>
    </div >
}