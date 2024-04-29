import styles from "@/styles/Search.module.css";

export function GlobalSearch() {
    return <div className={styles.box}>
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
        <input placeholder="Глобальный поиск" className={styles.input} />
    </div>
}