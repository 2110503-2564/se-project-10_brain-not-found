export default async function userSignUp(
    userName:string ,
    userEmail:string , 
    userRole:string ,
    userPassword:string ,
    userTel:string ,
) {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/register` , {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: userName ,
            email: userEmail ,
            role: userRole ,
            password: userPassword ,
            tel: userTel ,
        }),
    
    }
    )
    
    if(!response.ok){
        throw new Error ("Something went wrong to SignUp");
    }

    return await response.json();
}