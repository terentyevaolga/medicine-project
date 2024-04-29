import styles from '@/styles/EducationalMaterials.module.css';
import { useRouter } from 'next/router';
import { Modal, ModalContent, ModalBody, ModalOverlay, Button, useDisclosure, useToast, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../apiConfig';

export function AdminSummary() {

    const toast = useToast();
    const file = useRef(new FormData());
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { type } = router.query;
    const { isOpen, onClose, onOpen } = useDisclosure();
    const [data, setData] = useState([]);
    const [allData, setAllData] = useState([]);
    const [themes, setThemes] = useState([]);

    const [sortCourse, setSortCourse] = useState('');
    const [sortSubject, setSortSubject] = useState('');
    const [sort, setSortSearch] = useState('');

    const [course, setCourse] = useState('');
    const [subject, setSubject] = useState('');
    const [theme, setTheme] = useState('');
    const [title, setTitle] = useState('');

    const [fileName, setFileName] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        load();
    }, []);

    function load() {
        axios.get(`${API_BASE_URL}courses/file_sources`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then((res) => {
                console.log(res.data);
                setData(res.data);
            })
            .catch((e) => console.log(e));

        axios.get(`${API_BASE_URL}courses/`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then((res) => {
                console.log(res.data);
                setAllData(res.data);
            })
    };

    function addMaterial() {
        setLoading(true);
        file.current.append('file', selectedFile);
        file.current.append('part_title', theme);
        file.current.append('type', 'summary');
        file.current.append('title', title);
        if (subject.length > 0 && theme.length > 0 && title.length > 0 && fileName.length > 0) {
            try {
                axios.post(`${API_BASE_URL}admin/file-source-text`, file.current, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                })
                    .then((res) => {
                        file.current.delete('file');
                        setFileName('');
                        setSubject('');
                        setCourse('');
                        setTheme('');
                        setLoading(false);
                        load();
                        onClose();
                        toast({
                            title: 'Успешно', description: "Вы успешно добавили конспект", status: 'success', duration: 4000, isClosable: true, position: 'bottom-right'
                        });
                    })
                    .catch((e) => { console.log(e); setLoading(false); });
            } catch (e) {
                console.error(e);
            }

        } else {
            setLoading(false);
            toast({
                title: 'Ошибка', description: "Данные введены некорректно", status: 'error', duration: 4000, isClosable: true, position: 'bottom-right'
            });
        }
    };

    function selectSubject(t) {
        setSubject(t);
        allData[course].themes.map(x => x.title === t && setThemes(x.parts));
    };

    function lectionDelete(id) {
        axios.delete(`${API_BASE_URL}admin/file-source/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then((res) => {
                console.log(res.data);
                load();
                toast({
                    title: 'Успешно', description: "Вы успешно удалили конспект", status: 'success', duration: 4000, isClosable: true, position: 'bottom-right'
                });
            })
            .catch((e) => console.log(e));
    };

    return <>
        <p className={styles.title}>Учебные материалы. {type}</p>
        <div className={styles.container}>
            <div className={styles.headerBlock} >
                <div className={styles.box}>
                    <svg width="24" height="17" viewBox="0 0 24 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_227_125)">
                            <path fillRule="evenodd" clipRule="evenodd" d="M15.625 7.625C15.625 10.1103 13.6103 12.125 11.125 12.125C8.63972 12.125 6.625 10.1103 6.625 7.625C6.625 5.13972 8.63972 3.125 11.125 3.125C13.6103 3.125 15.625 5.13972 15.625 7.625ZM14.8042 12.3649C13.7882 13.1547 12.5115 13.625 11.125 13.625C7.81129 13.625 5.125 10.9387 5.125 7.625C5.125 4.31129 7.81129 1.625 11.125 1.625C14.4387 1.625 17.125 4.31129 17.125 7.625C17.125 9.01153 16.6547 10.2882 15.8649 11.3042L18.6553 14.0947C18.9482 14.3876 18.9482 14.8624 18.6553 15.1553C18.3624 15.4482 17.8876 15.4482 17.5947 15.1553L14.8042 12.3649Z" fill="#000B26" fillOpacity="0.48" />
                        </g>
                        <defs>
                            <clipPath id="clip0_227_125">
                                <rect width="24" height="16" fill="white" transform="translate(0 0.5)" />
                            </clipPath>
                        </defs>
                    </svg>
                    <input placeholder="Поиск" onChange={(e) => setSortSearch(e.target.value)} className={styles.input} />
                </div>
                <div className={styles.selectBlock}>
                    <Menu>
                        <MenuButton className={styles.menuButton}>
                            <div className={styles.menuButtonBlock}>
                                <p className={styles.menuButtonText}>{sortCourse !== '' ? `${sortCourse + 1} курс` : 'Выберите курс'}</p>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M18.5303 8.46967C18.8232 8.76256 18.8232 9.23744 18.5303 9.53033L12.5303 15.5303C12.2374 15.8232 11.7626 15.8232 11.4697 15.5303L5.46967 9.53033C5.17678 9.23744 5.17678 8.76256 5.46967 8.46967C5.76256 8.17678 6.23744 8.17678 6.53033 8.46967L12 13.9393L17.4697 8.46967C17.7626 8.17678 18.2374 8.17678 18.5303 8.46967Z" fill="#000B26" fillOpacity="0.72" />
                                </svg>
                            </div>
                        </MenuButton>
                        <MenuList className={styles.menuList} autoFocus={false} >
                            {[0, 1, 2, 3, 4].map((x, i) => <MenuItem key={i} className={styles.menuItem} onClick={() => { setSortCourse(x); setSortSubject('') }} >Курс {x + 1}</MenuItem>)}
                        </MenuList>
                    </Menu>
                    <Menu>
                        <MenuButton className={styles.menuButton}>
                            <div className={styles.menuButtonBlock}>
                                <p className={styles.menuButtonText}>{sortSubject !== '' ? sortSubject.split('. ')[1] : 'Выберите раздел'}</p>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M18.5303 8.46967C18.8232 8.76256 18.8232 9.23744 18.5303 9.53033L12.5303 15.5303C12.2374 15.8232 11.7626 15.8232 11.4697 15.5303L5.46967 9.53033C5.17678 9.23744 5.17678 8.76256 5.46967 8.46967C5.76256 8.17678 6.23744 8.17678 6.53033 8.46967L12 13.9393L17.4697 8.46967C17.7626 8.17678 18.2374 8.17678 18.5303 8.46967Z" fill="#000B26" fillOpacity="0.72" />
                                </svg>
                            </div>
                        </MenuButton>
                        <MenuList className={styles.menuList} autoFocus={false} >
                            {sortCourse !== '' && data.length > 0 && data[sortCourse]?.themes.map(x => x?.parts.map((y, i) => <MenuItem key={i} className={styles.menuItem} onClick={() => setSortSubject(y.title)} >{y.title.split('. ')[1]}</MenuItem>))}
                        </MenuList>
                    </Menu>
                    <button className={styles.buttonApply} onClick={() => { setSortCourse(''); setSortSubject(''); }} >Сбросить</button>
                </div>
            </div>
            <button className={styles.buttonApply} onClick={onOpen} >Добавить</button>
            <div className={styles.materialBlock}>
                <div className={styles.materialHeaderBlock} >
                    {['Заголовок', 'Раздел', 'Курс', 'Действие'].map((x, i) => <p key={i} className={styles.tableHeaderText}>{x}</p>)}
                </div>
                <div className={styles.materialBox}>
                    {data.map((x, num) => x.themes.map(y => y.parts.map(z => z.sources.map((n, i) => n.type === 'summary' && String(num).includes(sortCourse) && z.title.includes(sortSubject) && n.title.toLowerCase().includes(sort.toLowerCase()) && <div key={i} className={styles.tableItem}>
                        <p className={styles.tableItemText}>{n.title}</p>
                        <p className={styles.tableItemText}>{z.title.split('. ')[1]}</p>
                        <p className={`${styles.tableItemText} ${styles.tableItemCourse}`}>{num + 1}</p>
                        <button className={`${styles.tableItemText} ${styles.tableItemDelete}`} onClick={() => lectionDelete(n.uuid)} >Удалить</button>
                    </div>)))
                    )}
                </div>
            </div>
        </div>

        <Modal isOpen={isOpen} onClose={onClose} autoFocus={false} isCentered>
            <ModalOverlay />
            <ModalContent bg='none' >
                <ModalBody>
                    <div className={styles.modalSignIn}>
                        <div className={styles.modal_headerBlock}>
                            <p className={styles.modal_title}>Добавление</p>
                            <div onClick={onClose} className={styles.modal_close} >
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M24.7071 8.70711C25.0976 8.31658 25.0976 7.68342 24.7071 7.29289C24.3166 6.90237 23.6834 6.90237 23.2929 7.29289L16 14.5858L8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L14.5858 16L7.29289 23.2929C6.90237 23.6834 6.90237 24.3166 7.29289 24.7071C7.68342 25.0976 8.31658 25.0976 8.70711 24.7071L16 17.4142L23.2929 24.7071C23.6834 25.0976 24.3166 25.0976 24.7071 24.7071C25.0976 24.3166 25.0976 23.6834 24.7071 23.2929L17.4142 16L24.7071 8.70711Z" fill="#000B26" fillOpacity="0.72" />
                                </svg>
                            </div>
                        </div>
                        <div className={styles.modal_body}>
                            <div className={styles.modal_inputBlock}>
                                <div className={styles.line} >
                                    {[0, 1, 2, 3, 4].map((x, i) => <div key={i} onClick={() => { setCourse(x); setSubject(''); setTheme(''); }} className={`${styles.courseItem} ${x === course && styles.courseItemCheck}`}>
                                        <p>{x + 1} курс</p>
                                    </div>)}
                                </div>
                                <Menu>
                                    <MenuButton className={styles.menuButtonModal}>
                                        <div className={styles.menuButtonBlockModal}>
                                            <p className={styles.menuButtonTextModal}>{subject !== '' ? subject : 'Выберите предмет'}</p>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M18.5303 8.46967C18.8232 8.76256 18.8232 9.23744 18.5303 9.53033L12.5303 15.5303C12.2374 15.8232 11.7626 15.8232 11.4697 15.5303L5.46967 9.53033C5.17678 9.23744 5.17678 8.76256 5.46967 8.46967C5.76256 8.17678 6.23744 8.17678 6.53033 8.46967L12 13.9393L17.4697 8.46967C17.7626 8.17678 18.2374 8.17678 18.5303 8.46967Z" fill="#000B26" fillOpacity="0.72" />
                                            </svg>
                                        </div>
                                    </MenuButton>
                                    <MenuList className={styles.menuListModal} autoFocus={false} >
                                        {allData[course]?.themes.map((x, i) => <MenuItem key={i} onClick={() => selectSubject(x.title)} className={styles.menuItemModal}>{x.title}</MenuItem>)}
                                    </MenuList>
                                </Menu>
                                <Menu>
                                    <MenuButton className={styles.menuButtonModal}>
                                        <div className={styles.menuButtonBlockModal}>
                                            <p className={styles.menuButtonTextModal}>{theme !== '' ? theme : 'Выберите тему'}</p>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M18.5303 8.46967C18.8232 8.76256 18.8232 9.23744 18.5303 9.53033L12.5303 15.5303C12.2374 15.8232 11.7626 15.8232 11.4697 15.5303L5.46967 9.53033C5.17678 9.23744 5.17678 8.76256 5.46967 8.46967C5.76256 8.17678 6.23744 8.17678 6.53033 8.46967L12 13.9393L17.4697 8.46967C17.7626 8.17678 18.2374 8.17678 18.5303 8.46967Z" fill="#000B26" fillOpacity="0.72" />
                                            </svg>
                                        </div>
                                    </MenuButton>
                                    <MenuList className={styles.menuListModal} autoFocus={false} >
                                        {themes.map((x, i) => <MenuItem key={i} onClick={() => setTheme(x.title)} className={styles.menuItemModal}>{x.title}</MenuItem>)}
                                    </MenuList>
                                </Menu>
                                <input placeholder="Название конспекта" value={title} onChange={(e) => setTitle(e.target.value)} className={styles.modal_input} />
                                {fileName !== ''
                                    ? <p>{fileName}</p>
                                    : <label className="input-file">
                                        <input type='file' onChange={(e) => {
                                            if (e.target.files) {
                                                setSelectedFile(e.target.files[0]);
                                                setFileName(e.target.files[0].name);
                                            }
                                        }} />
                                        <span style={{ border: 'solid 1px #177165', borderRadius: '8px', padding: '10px', width: '100%', borderColor: '#177165', opacity: 0.6, fontSize: '16px', color: 'rgba(0,0,0,0.8)', fontWeight: 500, }}>Загрузить файл</span>
                                    </label>}
                            </div>
                            <div className={styles.modal_buttonBlock}>
                                <Button isLoading={loading} backgroundColor='#07C88E' borderRadius='8px' height='56px' width='100%' color='white' _hover={{}} fontWeight={500} onClick={addMaterial} >Добавить конспект</Button>
                            </div>
                        </div>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal >
    </>
}