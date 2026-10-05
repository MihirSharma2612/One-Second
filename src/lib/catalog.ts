export type Product = { slug:string; name:string; category:string; price:number; oldPrice?:number; image:string; colors:string[]; sizes:string[]; stock:number; description:string };
export const products:Product[] = [
  {slug:'static-noise-tee',name:'Static Noise Oversized Tee',category:'Oversized',price:1499,oldPrice:1899,image:'/images/tee.svg',colors:['#151515','#f6f5f0','#7f806c'],sizes:['S','M','L','XL'],stock:3,description:'Heavyweight cotton, cut for an easy unisex silhouette.'},
  {slug:'afterglow-tee',name:'Afterglow Heavyweight Tee',category:'Tees',price:1499,image:'/images/tee.svg',colors:['#f6f5f0','#151515'],sizes:['S','M','L','XL'],stock:12,description:'Everyday weight with a structured drape.'},
  {slug:'signal-boxy-tee',name:'Signal Boxy Tee',category:'Tees',price:1799,image:'/images/tee.svg',colors:['#151515','#61705b'],sizes:['S','M','L'],stock:8,description:'A soft boxy cut made to layer or wear alone.'},
  {slug:'still-frame-hoodie',name:'Still Frame Hoodie',category:'Hoodies',price:3499,image:'/images/hoodie.svg',colors:['#65705b','#151515'],sizes:['S','M','L','XL'],stock:5,description:'Midweight fleece with an understated graphic detail.'}
];
export const categories=['New Drop','Tees','Oversized','Hoodies','Bottoms','Accessories'];
export const money=(value:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value);
