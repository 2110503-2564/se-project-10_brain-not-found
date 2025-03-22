export default async function userLogiIn(userEmail:string , userPassword:string) {

    const response = await fetch("http://localhost:5000/api/v1/auth/login" , {
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