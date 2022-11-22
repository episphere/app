function calculator(divId){
    const arr=[
        ['1','2','3','+','('],
        ['4','5','6','-',')'],
        ['7','8','9','*','fun'],
        ['0','.','C','/','='],
    ]
    let div=document.getElementById(divId)
    if(!div){
        div =document.body
    }
    let divCalc = document.createElement('div')
    div.appendChild(divCalc)
    divCalc.innerHTML=`<i style="font-size:small"> episphere.github/app/jonas/calculator</i><br>`
    res = document.createElement('textarea')
    res.style.fontSize='large'
    res.style.color='cyan'
    res.style.backgroundColor='black'
    res.rows=5
    divCalc.appendChild(res)
    let tbl = document.createElement('table')
    divCalc.appendChild(tbl)
    let funSpan = document.createElement('span')
    divCalc.appendChild(funSpan)
    let funSel = document.createElement('select')
    funSel.style.fontSize='large'
    Object.getOwnPropertyNames(Math).forEach(funTxt=>{
        let opt = document.createElement('option')
        opt.text=funTxt
        funSel.appendChild(opt)
    })
    funSpan.appendChild(funSel)
    funSpan.innerHTML+=' <input type="checkbox" id="memList"> Mem'
    let memDiv = document.createElement('div')
    divCalc.appendChild(memDiv)
    
    // --- when memorization is checked  --- //
    function memFun(txt,val){
        console.log(txt,val)
        let memli = document.createElement('li')
        let i = memDiv.children.length+1
        memli.innerHTML=`<span style="color:gray">(${i})</span><button id="mem_${i}" onclick="res.value+='${val}';" style="color:maroon">M</button> <button style="color:gray
" onclick="this.parentElement.hidden=true;">X</button> <span style="color:blue">${txt}</span>=<span style="color:green">${val}</span> : <input value="..." style="color:gray;border-width:0">`
        
        //memli.querySelector('input').style.borderWidth=0
        memDiv.prepend(memli)
        //debugger
    }
    
    // if you want to be cool you'd do arr[0].forEach
    for(let i=0;i<arr.length;i++){ // rows
        let r = document.createElement('tr')
        tbl.appendChild(r)
            for(let j=0;j<arr[i].length;j++){ // columns
                let c = document.createElement('td')
                c.onclick=evt=>{
                    let txt = evt.currentTarget.innerText
                    switch(txt){
                        case 'C':
                            res.value='';
                            break;
                        case '=':
                            let val = eval(res.value);
                            if(document.getElementById('memList').checked){ // memorize answer
                                memFun(res.value,val)
                            }
                            res.value= val;
                            break;
                        case 'fun':
                            if(typeof(Math[funSel.value])=='function'){
                                res.value+=`Math.${funSel.value}(`
                            }else{
                                res.value+=`Math.${funSel.value}`
                            }
                            break;
                        default:
                            res.value+=txt
                    }
                    //debugger
                }
                r.appendChild(c)
                c.innerHTML=`<button style="font-size:x-large">${arr[i][j]}</button>`
            }
        //console.log(i)
    }
    return tbl
}