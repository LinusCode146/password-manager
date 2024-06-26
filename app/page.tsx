'use client'

import styles from '@/public/styles/Home.module.css';
import {FormEvent, useState} from "react";
import {useMutation} from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import {useRouter} from "next/navigation";
import hash from "@/util/cipher";
import {useMasterPassword} from "@/context/MasterPasswordContext";
import {PasswordData} from "@/public/types/main";


export default function Home() {
    const router = useRouter();
    const [masterPassword, setMasterPassword] = useState<string>('');
    const [createMode, setCreateMode] = useState<boolean>(false);
    const {setGlobalMasterPassword} = useMasterPassword();

    const createMasterpassword = useMutation({
        mutationFn: (data: PasswordData) => {
            return axios.post('/api/passwords/addMasterpassword', data);
        },
        onSuccess: () => {
            toast.success("Created Masterpassword");
        },
        onError: error => {
            if (error instanceof AxiosError) toast.error(error?.response?.data.message);
        }
    });

    const getUserMasterPassword = useMutation({
        mutationFn: async () => {
            return await axios.get('/api/passwords/getUserMasterpassword');
        },
        onSuccess: (data) => {
            const MP = data.data.password;
            if(hash(masterPassword.slice()) === MP) {
                setGlobalMasterPassword(masterPassword);
                toast.success("Correct Password");
                router.push("/dashboard");
            }else {
                toast.error("Incorrect Password");
            }
        },
        onError: error => {
            if (error instanceof AxiosError) toast.error(error?.response?.data.message);
        }
    });


    function submitHandler(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if ( createMode ) {
            createMasterpassword.mutate({password: masterPassword});
        } else {
            getUserMasterPassword.mutate();
        }
    }

    return (
        <>
            <form onSubmit={submitHandler} className={styles.container}>
                <label>Masterpassword</label>
                <input type="password" onChange={(e) => setMasterPassword(e.target.value)} />

                <div className={styles.mode}>
                    <button type="button" className={createMode ? styles.current : ''} onClick={() => setCreateMode(true)}>Create</button>
                    <button type="button" className={!createMode ? styles.current : ''} onClick={() => setCreateMode(false)}>Access</button>
                </div>
            </form>
        </>
    );
}
