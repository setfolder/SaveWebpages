(function() {
let ele, pEle, clone, doc, loc;

let win = selWin(window);  /* define the window object */
function selWin(w)
{
	if ( w.getSelection() != '' ) {return w};  /* if there was a manual selection, then win is window */
/* if window consists of frames, then win is each frame */
	for ( let i=0, f, r;  f = w.frames[i];  i++ ) { try{ if( r = arguments.callee(f) ) {return r} } catch(e){} };
};

if (win) /* if there was manual selection or frames */
{
  doc = win.document;
  loc = win.location;
  let s = win.getSelection();
  let r = s.getRangeAt(0);
  pEle = r.commonAncestorContainer;
  ele = r.cloneContents();
}
else /* if just take the whole window */
{
  doc = window.document;  /* Document */
  loc = window.location;  /* Location */
  pEle = doc.documentElement;  /* <html></html> */
  ele = ( doc.body || doc.getElementsByTagName('body')[0] ).cloneNode(true);  /* Tag body */
};

while (pEle)  /* take each documentElement (usually there is one, but in frames there are several) */
{
  if (pEle.nodeType == 1)  /* if this is Element */
  {
    clone = pEle.cloneNode(false);  /* clone its contents without nested elements */
    clone.appendChild(ele);  /* add contents from ele to it */
    ele = clone;
  };
  pEle = pEle.parentNode;
};  /* the output is the body tag, often with one or two 00 bytes at the end */

let sel = doc.createElement('div');  sel.appendChild(ele);  /* create a div, place the body tag in it */

let scripts = sel.getElementsByTagName('script');  /* find all scripts */
for (let i = scripts.length; i--;) { scripts[i].parentNode.removeChild(scripts[i]) };  /* and delete them */

let h = ele.insertBefore( doc.createElement('head') , ele.firstChild );  /* insert head tag */
ele.insertBefore( doc.createTextNode('\n') , ele.firstChild ); /* newline before head */
ele.appendChild(doc.createTextNode('\n')); /* line break after body */

let title = doc.getElementsByTagName('title')[0];  /* find title */
title = title ? title.text : 'untitled';  /* if it is not there, then write untitled */
let t = doc.createElement('title');  /* create a title tag */
t.text = title;  /* write the prepared text into it */
h.appendChild(t);  /* add title tag to head tag */
h.insertBefore( doc.createTextNode('\n') , t ); /* line feed before it */

let link = loc.href;  /* write the address line into link */

let metas = doc.createElement('meta');  /* create a meta tag */
metas.name = 'source'; metas.content = '' + link;  /* write in it about the source of the content */
h.appendChild(metas);  /* add meta tag to head tag */
h.insertBefore( doc.createTextNode('\n') , metas ); /* line feed before it */

let meta = doc.createElement('meta');  /* Create a meta tag */
meta.httpEquiv='content-type'; meta.content='text/html; charset=utf-8';  /* write the encoding into it */
h.appendChild(meta);  /* add meta tag to head tag */
h.insertBefore( doc.createTextNode('\n') , meta );  /* line feed before it */

let base = doc.getElementsByTagName('base')[0];  /* find the base tag */
let b = base ? base.cloneNode(false) : doc.createElement('base');  /* if it doesn't exist, then create it */
if (!b.href) {b.href=link};  /* and if there is no link in it, then write from link */
h.appendChild(b);  /* add this tag to the head tag */
h.insertBefore( doc.createTextNode('\n') , b );  /* line feed before it */
h.appendChild(doc.createTextNode('\n')); /* line break after it */

let styles = doc.styleSheets;  /* take all style tags with styles inside */
for (let i=0, si;  si=styles[i];  i++)  /* each style tag with styles inside is processed: */
{
	let style = doc.createElement('style');  /* create a new style tag */
	style.insertAdjacentHTML('afterbegin','\n');  /* insert a line break at the beginning */
	if (si.media.mediaText) {style.media = si.media.mediaText};  /* insert media parameters */
	try  /* work without errors */
	{        /* move each rule to a new style tag, they are written in the full description format */
	  for (let j=0,rule; rule=si.cssRules[j]; j++) { style.appendChild( doc.createTextNode(rule.cssText+'\n') ) }
	}
	  catch (e) { if(si.ownerNode) {style = si.ownerNode.cloneNode(false)} };  /* handle the error */
	h.appendChild(style);  /* add the ready style tag to the head tag */
	h.appendChild(doc.createTextNode('\n')); /* line break after it */
};

let doctype='<!DOCTYPE HTML PUBLIC \x22-//W3C//DTD HTML 4.01 Transitional//EN\x22 \x22http://www.w3.org/TR/html4/loose.dtd\x22>\n';

loc.href = 'data:text/phf;charset=UTF-8;base64,'+encodeBase64(doctype+sel.innerHTML);

function encodeBase64(a)
{
  let b='', d='';
  let c=0, i=0;
  let f=[];
  let e=a.length;
  let g='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  while ( c = a.charCodeAt(i++) )
  {
    if ( c < 0x80 ) { f[f.length] = c }
    else if ( c < 0x800 ) { f[f.length] = 0xc0 | (c>>6); f[f.length] = 0x80 | (c&0x3f); }
    else if ( c < 0x10000 )
    {
      f[f.length] = 0xe0 | (c>>12);
      f[f.length] = 0x80 | ( (c>>6) & 0x3f );
      f[f.length] = 0x80 | ( c & 0x3f );
    }
    else
    {
      f[f.length] = 0xf0 | (c>>18);
      f[f.length] = 0x80 | ( (c>>12) & 0x3f );
      f[f.length] = 0x80 | (  (c>>6) & 0x3f );
      f[f.length] = 0x80 | ( c & 0x3f);
    };
    if (i==e) { while(f.length %% 3) { f[f.length] = 0; d += '='; }  };
    if (f.length>2)
    {
      b += g[f[0]>>2];
      b += g[ ( (f.shift() & 3) << 4 ) | (f[0]>>4) ];
      b += g[ ( (f.shift() & 0xf) << 2 )| (f[0]>>6) ];
      b += g[ f.shift() & 0x3f ];
    };
  }
  return(b+d)
};

})()