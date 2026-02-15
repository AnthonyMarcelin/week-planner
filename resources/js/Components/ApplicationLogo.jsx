export default function ApplicationLogo(props) {
    return (
        <svg
            {...props}
            viewBox="0 0 50 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect width="50" height="50" rx="12" className="fill-indigo-600" />
            <path
                d="M15 15V35"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
            />
            <path
                d="M25 15V35"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeOpacity="0.5"
            />
            <path
                d="M35 15V35"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
            />
            <path
                d="M15 25H35"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
            />
        </svg>
    );
}