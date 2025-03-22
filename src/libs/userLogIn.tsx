export default async function userLogiIn(userEmail:string , userPassword:string) {

    const response = await fetch("https://project-sd-fronted-sub-backend.vercel.app/api/v1/auth/login" , {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email:userEmail,
            password: userPassword
        }),
    
    }
    )
    
    if(!response.ok){
        throw new Error ("Something went wrong to login");
    }
    const data = await response.json();
    return data;
    
}