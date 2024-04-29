import Head from "next/head";
import styles from '../styles/Account.module.css';
import { GlobalSearch, SideMenu } from "../components";
import '@fontsource-variable/inter';
import { useRouter } from "next/router";
import { useToast, Button } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from '../../apiConfig.js';

export default function Course() {

    const [data, setData] = useState([]);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [codeText, setCodeText] = useState('');
    const [codeTextMail, setCodeTextMail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const router = useRouter();

    const [code, setCode] = useState(false);
    const [codeMail, setCodeMail] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingMail, setLoadingMail] = useState(false);
    const toast = useToast();
    const regexMail = /^[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}$/i;

    useEffect(() => {
        load();
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
    };

    function editName() {
        if (name.split(' ').length == 2 && name.split(' ')[1] !== '') {
            axios.patch(`${API_BASE_URL}users/me/fido`, { name }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then(() => {
                    toast({
                        title: 'Успешно', description: "Вы изменили имя", status: 'success', duration: 4000, isClosable: true, position: 'bottom-right'
                    })
                })
                .catch((e) => {
                    console.log(e);
                })
        } else {
            if (name === '') return toast({
                title: 'Ошибка', description: "Вы не изменили данные", status: 'error', duration: 4000, isClosable: true, position: 'bottom-right'
            });
            if (name.split(' ').length !== 2 || name.split(' ')[1] !== '') toast({
                title: 'Ошибка', description: "Вы не корректно ввели данные", status: 'error', duration: 4000, isClosable: true, position: 'bottom-right'
            });
        }
    };

    function editMail() {
        setLoadingMail(true);
        if (regexMail.test(email)) {
            axios.post(`${API_BASE_URL}users/me/email/send`, { email }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then(() => {
                    setCodeMail(true);
                    setLoadingMail(false);
                })
                .catch((e) => {
                    console.log(e);
                    setLoadingMail(false);
                })
        } else {
            if (email === '') {
                setLoadingMail(false);
                return toast({
                    title: 'Ошибка', description: "Вы не изменили данные", status: 'error', duration: 4000, isClosable: true, position: 'bottom-right'
                });
            }
            if (!regexMail.test(email)) toast({
                title: 'Ошибка', description: "Вы не корректно ввели почту", status: 'error', duration: 4000, isClosable: true, position: 'bottom-right'
            });
            setLoadingMail(false);
        }
    };

    function editPassword() {        
        if (password.length > 0 && password === passwordConfirm) {
            axios.get(`${API_BASE_URL}users/me/password_change`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then((res) => {
                    console.log(res.data);
                    setCode(true);
                    setLoading(false);
                })
        } else {
            if (password.length === 0) {
                setLoading(false);
                toast({
                    title: 'Ошибка', description: "Вы не ввели пароль", status: 'error', duration: 4000, isClosable: true, position: 'bottom-right'
                });
            }
            if (password !== passwordConfirm) {
                setLoading(false);
                toast({
                    title: 'Ошибка', description: "Пароли не совпадают", status: 'error', duration: 4000, isClosable: true, position: 'bottom-right'
                });
            }
        }
    };

    function checkCode(url) {
        if (url === 'password') setLoading(true);

        if (codeText.length === 6 || codeTextMail.length === 6) {
            axios.post(`${API_BASE_URL}users/me/${url}?code=${url === 'email' ? codeTextMail : codeText}`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then(() => {
                    console.log('тут')
                    if (url === 'email') {
                        toast({
                            title: 'Успешно', description: "Вы изменили почту", status: 'success', duration: 4000, isClosable: true, position: 'bottom-right'
                        })
                        setCodeMail(false);
                        setEmail('');
                        setCodeMail('');
                    } else {
                        axios.patch(`${API_BASE_URL}users/me/password`, { password }, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        })
                            .then(() => {
                                setLoading(false);
                                toast({
                                    title: 'Успешно', description: "Вы изменили пароль", status: 'success', duration: 4000, isClosable: true, position: 'bottom-right'
                                })
                                setCode(false);
                                setPassword('');
                                setPasswordConfirm('');
                                setCode('');
                            })
                            .catch((e) => {
                                console.log(e);
                                setLoading(false);
                            });
                    }
                })
                .catch((e) => {
                    setLoading(false);
                    console.log(e);
                })
        } else {
            if (codeTextMail.length !== 6 || codeText.length !== 6) toast({
                title: 'Ошибка', description: "Вы не корректно ввели код", status: 'error', duration: 4000, isClosable: true, position: 'bottom-right'
            });
            setLoading(false);
        }
    }

    return <>
        <Head>
            <title>Редактирование информации</title>
            <meta name="description" content="" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main>
            <SideMenu />
            <GlobalSearch />
            <div className={styles.container}>
                <p className={styles.titleEdit}>Редактировать информацию</p>
                <div className={styles.editBlocks}>
                    <div className={styles.editTwoBlock} >
                        <div className={styles.editBlock}>
                            <input placeholder="Имя и фамилия" defaultValue={data.fido} onChange={(e) => setName(e.target.value)} className={styles.modal_input} />
                            <Button backgroundColor='#07C88E' borderRadius='8px' height='56px' width='100%' color='white' _hover={{}} fontWeight={500} onClick={() => editName()}>Обновить имя</Button>
                        </div>
                        <div className={styles.editBlock}>
                            <input placeholder="Новый пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.modal_input} />
                            <input placeholder="Новый пароль ещё раз" type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} className={styles.modal_input} />
                            {code && <input placeholder="Код был отправлен вам на почту" value={codeText} onChange={(e) => setCodeText(e.target.value)} className={styles.modal_input} />}
                            <Button isLoading={loading} backgroundColor='#07C88E' borderRadius='8px' height='56px' width='100%' color='white' _hover={{}} fontWeight={500} onClick={() => code ? checkCode('password') : editPassword()}>{code ? 'Подтвердить' : 'Обновить пароль'}</Button>
                        </div>
                    </div>
                    <div className={styles.editBlock}>
                        <input placeholder="Почта" defaultValue={data.email} onChange={(e) => setEmail(e.target.value)} className={styles.modal_input} />
                        {codeMail && <input placeholder="Код был отправлен вам на почту" value={codeTextMail} onChange={(e) => setCodeTextMail(e.target.value)} className={styles.modal_input} />}
                        <Button isLoading={loadingMail} backgroundColor='#07C88E' borderRadius='8px' height='56px' width='100%' color='white' _hover={{}} fontWeight={500} onClick={() => codeMail ? checkCode('email') : editMail()}>{codeMail ? 'Обновить почту' : 'Отправить код'}</Button>
                    </div>
                </div>
                <div className={styles.logOutBlock} onClick={() => router.push('/cabinet')} >
                    <div className={styles.logOutIcon}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M6.21967 0.46967C6.51256 0.176777 6.98744 0.176777 7.28033 0.46967L13.2803 6.46967C13.5732 6.76256 13.5732 7.23744 13.2803 7.53033L7.28033 13.5303C6.98744 13.8232 6.51256 13.8232 6.21967 13.5303C5.92678 13.2374 5.92678 12.7626 6.21967 12.4697L10.9393 7.75H0.75C0.335786 7.75 0 7.41421 0 7C0 6.58579 0.335786 6.25 0.75 6.25H10.9393L6.21967 1.53033C5.92678 1.23744 5.92678 0.762563 6.21967 0.46967Z" fill="#000B26" fillOpacity="0.72" />
                        </svg>
                    </div>
                    <p className={styles.cources_item}>Вернуться назад</p>
                </div>
            </div>
        </main>
    </>
}