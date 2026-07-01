/* ============================================================
   plotter.js — motor liviano de gráficos "a mano" en <canvas>
   Sin dependencias externas.
   ============================================================ */
(function(){
  "use strict";

  const INK = {
    axis:'#2a2622',
    blue:'#233e82',
    blueSoft:'#3357a8',
    red:'#b6392f',
    green:'#276b45',
    purple:'#6a3f8f',
    grid:'#e4dcc7'
  };
  window.NB_INK = INK;

  class NotebookPlot{
    constructor(canvas, opts){
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.xMin = opts.xMin ?? -10;
      this.xMax = opts.xMax ?? 10;
      this.yMin = opts.yMin ?? -10;
      this.yMax = opts.yMax ?? 10;
      this.xStep = opts.xStep ?? 1;
      this.yStep = opts.yStep ?? 1;
      this.padding = opts.padding ?? 26;
      this.showGrid = opts.showGrid !== false;
      this._cssW = opts.cssWidth || canvas.clientWidth || 600;
      this._cssH = opts.cssHeight || opts.aspect ? this._cssW*(opts.aspect||0.62) : 380;
      this._resize();
      window.addEventListener('resize', ()=>{ this._resize(); if(this._redraw) this._redraw(); });
      if(document.fonts && document.fonts.ready){
        document.fonts.ready.then(()=>{ if(this._redraw) this._redraw(); });
      }
    }
    _resize(){
      const dpr = Math.min(window.devicePixelRatio||1, 2);
      const w = this.canvas.clientWidth || this._cssW;
      const h = this._cssH * (w/this._cssW);
      this.canvas.width = w*dpr;
      this.canvas.height = h*dpr;
      this.canvas.style.height = h+'px';
      this.ctx.setTransform(dpr,0,0,dpr,0,0);
      this.W = w; this.H = h;
    }
    onRedraw(fn){ this._redraw = fn; }

    toPx(x,y){
      const px = this.padding + (x - this.xMin) / (this.xMax - this.xMin) * (this.W - 2*this.padding);
      const py = this.H - this.padding - (y - this.yMin) / (this.yMax - this.yMin) * (this.H - 2*this.padding);
      return {x:px, y:py};
    }
    toData(px,py){
      const x = this.xMin + (px - this.padding) / (this.W - 2*this.padding) * (this.xMax - this.xMin);
      const y = this.yMin + (this.H - this.padding - py) / (this.H - 2*this.padding) * (this.yMax - this.yMin);
      return {x,y};
    }
    clear(){
      const ctx=this.ctx;
      ctx.clearRect(0,0,this.W,this.H);
    }
    clipToPlot(){
      const ctx=this.ctx;
      const a=this.toPx(this.xMin,this.yMax), b=this.toPx(this.xMax,this.yMin);
      ctx.save();
      ctx.beginPath();
      ctx.rect(a.x, a.y, b.x-a.x, b.y-a.y);
      ctx.clip();
    }
    unclip(){ this.ctx.restore(); }

    drawGrid(){
      if(!this.showGrid) return;
      const ctx=this.ctx;
      ctx.save();
      ctx.strokeStyle = INK.grid;
      ctx.lineWidth = 1;
      for(let x=Math.ceil(this.xMin/this.xStep)*this.xStep; x<=this.xMax; x+=this.xStep){
        const p1=this.toPx(x,this.yMin), p2=this.toPx(x,this.yMax);
        ctx.beginPath(); ctx.moveTo(p1.x+.5,p1.y); ctx.lineTo(p2.x+.5,p2.y); ctx.stroke();
      }
      for(let y=Math.ceil(this.yMin/this.yStep)*this.yStep; y<=this.yMax; y+=this.yStep){
        const p1=this.toPx(this.xMin,y), p2=this.toPx(this.xMax,y);
        ctx.beginPath(); ctx.moveTo(p1.x,p1.y+.5); ctx.lineTo(p2.x,p2.y+.5); ctx.stroke();
      }
      ctx.restore();
    }

    drawAxes(opts={}){
      const ctx=this.ctx;
      ctx.save();
      ctx.strokeStyle = INK.axis;
      ctx.fillStyle = INK.axis;
      ctx.lineWidth = 2.4;
      ctx.lineCap='round';
      // eje x
      const y0 = this.toPx(0, Math.max(this.yMin,Math.min(0,this.yMax))).y;
      const yClamped = Math.max(this.padding, Math.min(this.H-this.padding, y0));
      ctx.beginPath(); ctx.moveTo(this.padding-6, yClamped); ctx.lineTo(this.W-this.padding+10, yClamped); ctx.stroke();
      this._arrow(this.W-this.padding+10, yClamped, 0);
      // eje y
      const x0 = this.toPx(Math.max(this.xMin,Math.min(0,this.xMax)),0).x;
      const xClamped = Math.max(this.padding, Math.min(this.W-this.padding, x0));
      ctx.beginPath(); ctx.moveTo(xClamped, this.H-this.padding+6); ctx.lineTo(xClamped, this.padding-10); ctx.stroke();
      this._arrow(xClamped, this.padding-10, -90);

      ctx.font = '15px Kalam, cursive';
      ctx.fillText('x', this.W-this.padding+10, yClamped-8);
      ctx.fillText('y', xClamped+8, this.padding-10);

      if(opts.ticks!==false){
        ctx.font = '12px Kalam, cursive';
        ctx.textAlign='center'; ctx.textBaseline='top';
        for(let x=Math.ceil(this.xMin/this.xStep)*this.xStep; x<=this.xMax; x+=this.xStep){
          if(Math.abs(x)<1e-9) continue;
          const p=this.toPx(x,0);
          const py = Math.max(this.padding, Math.min(this.H-this.padding, p.y));
          ctx.beginPath(); ctx.moveTo(p.x,py-4); ctx.lineTo(p.x,py+4); ctx.stroke();
          if(this.xStep < 1 || (this.xMax-this.xMin) <= 24) ctx.fillText(this._fmt(x), p.x, py+6);
        }
        ctx.textAlign='right'; ctx.textBaseline='middle';
        for(let y=Math.ceil(this.yMin/this.yStep)*this.yStep; y<=this.yMax; y+=this.yStep){
          if(Math.abs(y)<1e-9) continue;
          const p=this.toPx(0,y);
          const px = Math.max(this.padding, Math.min(this.W-this.padding, p.x));
          ctx.beginPath(); ctx.moveTo(px-4,p.y); ctx.lineTo(px+4,p.y); ctx.stroke();
          if(this.yStep < 1 || (this.yMax-this.yMin) <= 24) ctx.fillText(this._fmt(y), px-7, p.y);
        }
      }
      ctx.restore();
    }
    _fmt(n){
      return (Math.round(n*100)/100).toString().replace('-','−');
    }
    _arrow(x,y,angleDeg){
      const ctx=this.ctx;
      const a = angleDeg*Math.PI/180;
      ctx.save();
      ctx.translate(x,y); ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(0,0); ctx.lineTo(-9,-5); ctx.lineTo(-9,5); ctx.closePath();
      ctx.fillStyle = INK.axis;
      ctx.fill();
      ctx.restore();
    }

    /* dibuja una función; excludeAt: array de x donde hay hueco (bolita vacía);
       asymptoteAt: array de x donde la función no está definida (corta la curva) */
    plotFunction(fn, opts={}){
      const ctx=this.ctx;
      const color = opts.color || INK.blue;
      const lw = opts.lineWidth || 3;
      const domain = opts.domain || [this.xMin, this.xMax];
      const samples = opts.samples || 500;
      const asym = opts.asymptoteAt || [];
      const maxJump = (this.yMax-this.yMin)*1.6;

      this.clipToPlot();
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.lineJoin='round'; ctx.lineCap='round';
      if(opts.dash) ctx.setLineDash(opts.dash);

      let path = [];
      const flush = ()=>{
        if(path.length>1){
          ctx.beginPath();
          ctx.moveTo(path[0].x,path[0].y);
          for(let i=1;i<path.length;i++) ctx.lineTo(path[i].x,path[i].y);
          ctx.stroke();
        }
        path=[];
      };
      let prevY = null;
      for(let i=0;i<=samples;i++){
        const x = domain[0] + (domain[1]-domain[0])*i/samples;
        const nearAsym = asym.some(a=>Math.abs(x-a) < (domain[1]-domain[0])/samples*1.5);
        let y;
        try{ y = fn(x); }catch(e){ y = NaN; }
        if(nearAsym || !isFinite(y) || y===null){ flush(); prevY=null; continue; }
        if(prevY!==null && Math.abs(y-prevY) > maxJump){ flush(); }
        const p = this.toPx(x,y);
        path.push(p);
        prevY = y;
      }
      flush();
      ctx.restore();
      this.unclip();
    }

    point(x,y,opts={}){
      const ctx=this.ctx;
      const p=this.toPx(x,y);
      const r = opts.r || 6;
      ctx.save();
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = opts.color || INK.red;
      ctx.fillStyle = opts.hollow ? '#fdfcf7' : (opts.color || INK.red);
      ctx.beginPath();
      ctx.arc(p.x,p.y,r,0,Math.PI*2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      if(opts.label){
        ctx.save();
        ctx.font='14px Kalam, cursive';
        ctx.fillStyle = opts.color || INK.red;
        ctx.textAlign = opts.labelAlign || 'left';
        ctx.fillText(opts.label, p.x + (opts.labelDx ?? 10), p.y + (opts.labelDy ?? -8));
        ctx.restore();
      }
      return p;
    }

    vLine(x, opts={}){
      const ctx=this.ctx;
      const p1=this.toPx(x,this.yMin), p2=this.toPx(x,this.yMax);
      ctx.save();
      ctx.strokeStyle = opts.color || INK.red;
      ctx.lineWidth = opts.lineWidth || 2.4;
      ctx.setLineDash(opts.dash || [7,6]);
      ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); ctx.stroke();
      ctx.restore();
      if(opts.label){
        ctx.save();
        ctx.font='14px Kalam, cursive';
        ctx.fillStyle = opts.color || INK.red;
        ctx.textAlign='center';
        ctx.fillText(opts.label, p1.x, this.toPx(0,this.yMax).y + 14);
        ctx.restore();
      }
    }
    hLine(y, opts={}){
      const ctx=this.ctx;
      const p1=this.toPx(this.xMin,y), p2=this.toPx(this.xMax,y);
      ctx.save();
      ctx.strokeStyle = opts.color || INK.green;
      ctx.lineWidth = opts.lineWidth || 2.4;
      ctx.setLineDash(opts.dash || [7,6]);
      ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); ctx.stroke();
      ctx.restore();
      if(opts.label){
        ctx.save();
        ctx.font='14px Kalam, cursive';
        ctx.fillStyle = opts.color || INK.green;
        ctx.textAlign='left';
        ctx.fillText(opts.label, this.padding+4, p1.y-6);
        ctx.restore();
      }
    }
    hBand(yFrom,yTo,opts={}){
      const ctx=this.ctx;
      const p1=this.toPx(this.xMin,yTo), p2=this.toPx(this.xMax,yFrom);
      ctx.save();
      ctx.fillStyle = opts.color || 'rgba(35,62,130,.15)';
      ctx.fillRect(p1.x, p1.y, p2.x-p1.x, p2.y-p1.y);
      ctx.restore();
    }
    vBand(xFrom,xTo,opts={}){
      const ctx=this.ctx;
      const p1=this.toPx(xFrom,this.yMax), p2=this.toPx(xTo,this.yMin);
      ctx.save();
      ctx.fillStyle = opts.color || 'rgba(182,57,47,.15)';
      ctx.fillRect(p1.x, p1.y, p2.x-p1.x, p2.y-p1.y);
      ctx.restore();
    }
    segment(x1,y1,x2,y2,opts={}){
      const ctx=this.ctx;
      const p1=this.toPx(x1,y1), p2=this.toPx(x2,y2);
      ctx.save();
      ctx.strokeStyle=opts.color||INK.purple;
      ctx.lineWidth=opts.lineWidth||2.6;
      if(opts.dash) ctx.setLineDash(opts.dash);
      ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); ctx.stroke();
      ctx.restore();
    }
    text(x,y,str,opts={}){
      const ctx=this.ctx;
      const p=this.toPx(x,y);
      ctx.save();
      ctx.font = (opts.size||15)+'px Kalam, cursive';
      ctx.fillStyle = opts.color || INK.axis;
      ctx.textAlign = opts.align || 'left';
      ctx.fillText(str,p.x,p.y);
      ctx.restore();
    }

    /* helper: hace que un punto sea arrastrable en X (o X libre) llamando cb(xData) */
    makeDraggableX(getXY, cb, opts={}){
      const canvas=this.canvas;
      let dragging=false;
      const rect = ()=>canvas.getBoundingClientRect();
      const near = (px,py)=>{
        const xy = getXY();
        const p = this.toPx(xy.x, xy.y);
        return Math.hypot(p.x-px,p.y-py) < (opts.hitRadius||22);
      };
      const posFromEvent = (e)=>{
        const r = rect();
        const cx = (e.touches? e.touches[0].clientX : e.clientX) - r.left;
        const cy = (e.touches? e.touches[0].clientY : e.clientY) - r.top;
        return {px:cx*(canvas.width/r.width)/(window.devicePixelRatio&&1||1), py:cy};
      };
      const toData=(px,py)=>{
        // px,py here are CSS pixels already (since we didn't rescale) -> use directly
        return this.toData(px,py);
      };
      const down = (e)=>{
        const r=rect();
        const cx=(e.touches?e.touches[0].clientX:e.clientX)-r.left;
        const cy=(e.touches?e.touches[0].clientY:e.clientY)-r.top;
        if(near(cx,cy)){ dragging=true; canvas.style.cursor='grabbing'; e.preventDefault(); }
      };
      const move = (e)=>{
        if(!dragging) return;
        const r=rect();
        const cx=(e.touches?e.touches[0].clientX:e.clientX)-r.left;
        let d = toData(cx,0);
        let x = d.x;
        if(opts.clamp) x = Math.max(opts.clamp[0], Math.min(opts.clamp[1], x));
        if(opts.snap) x = Math.round(x/opts.snap)*opts.snap;
        if(opts.forbid && opts.forbid.some(f=>Math.abs(x-f)<(opts.snap||0.02))) {
          x = x + (opts.snap||0.02)* (x<opts.forbid[0]?-1:1);
        }
        cb(x);
        e.preventDefault();
      };
      const up = ()=>{ dragging=false; canvas.style.cursor='crosshair'; };
      canvas.addEventListener('mousedown',down);
      canvas.addEventListener('mousemove',move);
      window.addEventListener('mouseup',up);
      canvas.addEventListener('touchstart',down,{passive:false});
      canvas.addEventListener('touchmove',move,{passive:false});
      window.addEventListener('touchend',up);
    }
  }

  window.NotebookPlot = NotebookPlot;
})();
