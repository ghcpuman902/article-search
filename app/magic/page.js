'use client'
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Page() {
    const [revalidateText, setRevalidateText] = useState('');

    const handleRevalidateButtonClick = (type) => {
        const fetchData = async () => {
            const res = await fetch('/api/revalidate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type: type }),
            });
            if (!res.ok) {
                throw new Error('Failed to fetch', resJson);
            }
            const resJson = await res.json();
            setRevalidateText(JSON.stringify(resJson, null, 2));
        }
        fetchData();
    }

    return (
        <div className="mt-6 mb-3 w-full flex flex-col gap-2 justify-center ">
            <Button variant='destructive' className="max-w-[400px]" onClick={()=>{handleRevalidateButtonClick('tag');}}>Revalidate 'article' cache on server</Button>
            <Button variant='destructive' className="max-w-[400px]" onClick={()=>{handleRevalidateButtonClick('path');}}>Revalidate '/works/article-search' cache on server</Button>
            {revalidateText ? (<Alert variant="destructive" className="max-w-[400px]">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{revalidateText}</AlertDescription>
            </Alert>) : null}
        </div>);
}