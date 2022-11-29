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
    div.innerHTML=`<b style="color:maroon">A)</b> PGS # <input id="pgsID" value=${i} size=5> <button id='btLoadPgs'>load</button>
    <span id="summarySpan" hidden=true>[<a id="urlPGS" href='' target="_blank">source</a>]<br><span id="trait_mapped">...</span>, <span id="dataRows">...</span> variants, [<a id="pubDOI" target="_blank">Pub</a>], [<a href="#" id="objJSON">JSON</a>].</span>
    <p><textarea id="pgsTextArea" style="background-color:black;color:lime" cols=60 rows=5>...</textarea></p>`;
    div.querySelector('#pgsID').onkeyup=(evt=>{
        if(evt.keyCode==13){
            div.querySelector('#btLoadPgs').click()
        }
    })
    PGS23.pgsTextArea = div.querySelector('#pgsTextArea')
    div.querySelector('#btLoadPgs').onclick=async (evt)=>{
        PGS23.pgsTextArea.value='loading ...'
        i = parseInt(div.querySelector('#pgsID').value)
        let PGSstr = i.toString()
        PGSstr = "PGS000000".slice(0,-PGSstr.length)+PGSstr
        div.querySelector('#urlPGS').href=`https://ftp.ebi.ac.uk/pub/databases/spot/pgs/scores/${PGSstr}/ScoringFiles/Harmonized/`
        PGS23.pgsObj = await parsePGS(i)
        div.querySelector('#summarySpan').hidden=false
        div.querySelector('#pubDOI').href='https://doi.org/'+PGS23.pgsObj.meta.citation.match(/doi\:.*$/)[0]
        div.querySelector('#trait_mapped').innerHTML=`<span style="color:maroon">${PGS23.pgsObj.meta.trait_mapped}</span>`
        div.querySelector('#dataRows').innerHTML=PGS23.pgsObj.dt.length
        if(PGS23.pgsObj.txt.length<100000){
            PGS23.pgsTextArea.value = PGS23.pgsObj.txt
        }else{
            PGS23.pgsTextArea.value = PGS23.pgsObj.txt.slice(0,100000)+`...\n... (${PGS23.pgsObj.dt.length} variants) ...`
        }
        
        //debugger
    };
    div.querySelector("#objJSON").onclick=evt=>{
		//console.log(Date())
		let cleanObj = structuredClone(PGS23.pgsObj)
		cleanObj.info=cleanObj.txt.match(/^[^\n]*/)[0]
		delete cleanObj.txt
		saveFile(JSON.stringify(cleanObj),cleanObj.meta.pgs_id+'.json')
    }
}

PGS23.load23 = async ()=>{
    let div = PGS23.div23
    div.innerHTML=`<hr><b style="color:maroon">B)</b> Load your 23andMe data file: <input type="file" id="file23andMeInput">`
	div.querySelector('#file23andMeInput').onchange=evt=>{
		// if the decompressed txt file is being provided
		let readTxt = new FileReader()
		let readZip = new FileReader()
		readTxt.onload=ev=>{
			let txt = ev.target.result;
			debugger
		}
		readZip.readAsArrayBuffer=ev=>{
			debugger
			ev.arrayBuffer(aa=>{
				debugger
			})
			
		}
		
		if(evt.target.files[0].name.match(/\.txt$/)){
			readTxt.readAsText(evt.target.files[0])
		}else if(evt.target.files[0].name.match(/\.zip$/)){
			readZip.readAsArrayBuffer(evt.target.files[0])
			//debugger
		}else{
			console.error(`wrong file type, neither .txt nor .zip: "${evt.target.files[0].name}"`)
		}
	}
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
    Below you can select, and inspect, <b style="color:maroon">A)</b> the PGS catalog entry with the risk scores for a list of genomic variations; and <b style="color:maroon">B)</b> Your 23andMe <a href="https://you.23andme.com/tools/data/download" target="_blank">data download</a>. Once you have both (A) and (B), you proceed to <b style="color:maroon">C)</b> calculate your relative risk for the trait targetted by the PGS entry.
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
    obj.txt = await pgs.loadScore(i)
    let rows = obj.txt.split(/[\r\n]/g)
    let metaL = rows.filter(r=>(r[0]=='#')).length
    obj.meta = {txt:rows.slice(0,metaL)}
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
    // parse metadata
    obj.meta.txt.filter(r=>(r[1]!='#')).forEach(aa=>{
        aa=aa.slice(1).split('=')
        obj.meta[aa[0]]=aa[1]
        //debugger
    })
    return obj
}

function saveFile(x,fileName) { // x is the content of the file
	// var bb = new Blob([x], {type: 'application/octet-binary'});
	// see also https://github.com/eligrey/FileSaver.js
	var bb = new Blob([x]);
   	var url = URL.createObjectURL(bb);
	var a = document.createElement('a');
   	a.href=url;
	if (fileName){
		if(typeof(fileName)=="string"){ // otherwise this is just a boolean toggle or something of the sort
			a.download=fileName;
		}
		a.click() // then download it automatically 
	} 
	return a
}

export{
    ui,
    PGS23,
    parsePGS
}