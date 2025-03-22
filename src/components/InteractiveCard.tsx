'use client'

export default function InteractiveCard( {children , contentName} : {children: React.ReactNode ,contentName: string})  {
    
    function onSelected(){
        alert('You select ' + contentName);
    }
    
    function onMouseAction(event: React.SyntheticEvent){
        if(event.type=='mouseover')
        {   
            event.currentTarget.classList.remove('shadow-lg');
            event.currentTarget.classList.remove('bg-white');
            event.currentTarget.classList.add('shadow-2xl');
            event.currentTarget.classList.add('bg-neutral-200');
        }else{
            event.currentTarget.classList.remove('shadow-2xl');
            event.currentTarget.classList.remove('bg-neutral-200');
            event.currentTarget.classList.add('shadow-lg');
            event.currentTarget.classList.add('bg-white');
        }
    }

    return(
        <div className='bg-white w-full h-[450px] rounded-lg shadow-lg m-[1px]'
            // onClick={ ()=>  onSelected() }
            onMouseOver={ (e)=>onMouseAction(e) }
            onMouseOut={ (e)=>onMouseAction(e) }
        >
            { children }
        </div>
    );
}