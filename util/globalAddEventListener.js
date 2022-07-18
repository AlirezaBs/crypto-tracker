export default function globalAddEventListener(type, selector, callBack){
    document.addEventListener(type, (e) => {
        if(e.target.matches(selector)){
            callBack(e)
        }
    })
}