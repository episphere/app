// This library was created before transitioning fully to ES6 modules
// Specifically the pgs library is a dependency satisfied by script tag loading
if(typeof(pgs)=='undefined'){
    let s = document.createElement('script')
    s.src='https://episphere.github.io/pgs/pgs.js'
    document.head.appendChild(s)
}
// pgs is now in the global scope, if it was not there already

let PGS23 = {} // a global variable that is not shared by export

PGS23.loadPGS = async (i=4)=>{ // startng with a default pgs
    let div = PGS23.divPGS
    div.innerHTML=`PGS # <input id="pgsID" value=${i} size=5> <button id='btLoadPgs'>load</button>`;
    div.querySelector('#btLoadPgs').onclick=async (evt)=>{
        PGS23.pgsObj = await parsePGS(i)
        //debugger
    };
}

PGS23.load23 = async ()=>{
    let div = PGS23.div23
    div.innerHTML=`... 23 ...`
}

function ui(targetDiv=document.body){ // target div for the user interface
    //console.log(`prsCalc module imported at ${Date()}`)
    if(typeof(targetDiv)=='string'){
        targetDiv=getElementById('targetDiv')
    }
    //console.log(pgs)
    let div = document.createElement('div')
    targetDiv.appendChild(div)
    div.id='prsCalcUI'
    div.innerHTML=`
    <p>
    Individual relative risk score for 23andme reports based on <a href='https://www.pgscatalog.org' target="_blank">PGS Catalog</a>.
    [<a href="https://github.com/episphere/app/tree/main/jonas/prs" target="_blank">code</a>][<a href="https://observablehq.com/@episphere/pgs" target="_blank">notebook</a>][<a href="https://gitter.im/episphere/PRS">discussion</a>].
    </p>
    <hr>
    `
    // recall that PGS23 is only global to the module, it is not exported
    PGS23.divPGS = document.createElement('div');div.appendChild(PGS23.divPGS)
    PGS23.div23 = document.createElement('div');div.appendChild(PGS23.div23)
    // the more conventional alternative would be something like 
    // let divPGS = document.createElement('div');div.appendChild(divPGS)
    // let div23 = document.createElement('div');div.appendChild(div23)
    div.PGS23=PGS23 // mapping the module global variable to the UI ... discuss
    PGS23.div=div // for convenience, mapping the in multiple ways
    PGS23.loadPGS()
    PGS23.load23()
}

async function parsePGS(i=4){
    let obj = {id:i}
    let rows = (await pgs.loadScore(i)).split(/[\r\n]/g)
    let metaL = rows.filter(r=>(r[0]=='#')).length
    obj.meta = rows.slice(0,metaL)
    obj.cols = rows[metaL].split(/\t/g)
    obj.dt = rows.slice(metaL+1).map(r=>r.split(/\t/g))
    if(obj.dt.slice(-1).length==1){
        obj.dt.pop(-1)
    }
    // parse numerical types
    //const indInt=obj.cols.map((c,i)=>c.match(/_pos/g)?i:null).filter(x=>x)
    const indInt=[obj.cols.indexOf('chr_position'),obj.cols.indexOf('hm_pos')]
    const indFloat=[obj.cols.indexOf('effect_weight'),obj.cols.indexOf('allelefrequency_effect')]
    const indBol=[obj.cols.indexOf('hm_match_chr'),obj.cols.indexOf('hm_match_pos')]
    obj.dt=obj.dt.map(r=>{ // for each data row
        indFloat.forEach(ind=>{
            r[ind]=parseFloat(r[ind])
        })
        indInt.forEach(ind=>{
            r[ind]=parseInt(r[ind])
        })
        indBol.forEach(ind=>{
            r[ind]=(r[11]=='True')?true:false
        })
        return r
    })
    return obj
}

export{
    ui,
    PGS23,
    parsePGS
}