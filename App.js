const options = {
    lineWidth:3
}
class App{
    constructor(){
        this.canvas = document.querySelector("#noteCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.cWidth = 0;
        this.cHeight = 0;
        this.wSize = 0; //셀의 너비
        this.hSize = 0; //셀의 높이
        window.addEventListener("resize", this.resize.bind(this));
        this.resize(); //최초 1회 실행
        this.aCtx = [];
        for(let i = 0; i < 24; i++){
            this.aCtx.push(new AudioContext());
        }
        this.addEvent();

        this.cellData = [];
        this.fillCellData();
        this.colorCode = ['#C5DFEA', '#8FA7AD', '#999FBE', '#D8BED7', '#FED4C7',
                         '#F4F1DB', '#FEDFE6', '#D6A7CF', '#8887A2', '#ADE5E8', 
                        '#D8F8F3', '#EDEBF9', '#C5DFEA', '#8FA7AD', '#999FBE', 
                        '#D8BED7', '#FED4C7', '#F4F1DB', '#FEDFE6', '#D6A7CF',
                        '#8887A2', '#ADE5E8', '#D8F8F3', '#EDEBF9'];
        this.codeName = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];
        this.freq = [ 130.8,138.6,146.8,155.6,164.8,174.6,185.0,196.0,207.7,220.0,233.1,246.9,
                      261.6,277.2,293.7,311.1,329.6,349.2,370.0,392.0,415.3,440.0,466.2,493.9 ];
        this.playIdx = 0;
        this.tempo = 0.2;//1초에 2개의 음이 재생
        this.tempoTime = 0; //현재 템포

        this.canvas.addEventListener("click", this.clickHandle.bind(this)); //캔버스 클릭시
        let date = new Date();
        this.beforeTime = date.getTime();
        this.startFrame();

    }

    fillCellData(){
        for(let i = 0; i < 24; i++){
            this.cellData[i] = [];
            for(let j = 0; j < 30; j++){
                this.cellData[i][j] = false;
            }
        }   
    }

    resize(){
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.cWidth = this.canvas.width;
        this.cHeight = this.canvas.height;
    }

    startFrame(){
        requestAnimationFrame(this.startFrame.bind(this));
        let date = new Date();
        let nowTime = date.getTime();
        let delta = (nowTime - this.beforeTime) / 1000;
        this.beforeTime = nowTime;
        this.update(delta);
        this.render();
    }

    render(){
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.cWidth, this.cHeight);
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, this.cWidth, this.cHeight);

        ctx.strokeStyle = "#fff";
        const wSize = this.wSize = (this.cWidth - 100) / 30;
        const hSize = this.hSize = (this.cHeight - 100) / 24;

        //격자 버튼 판 그리기
        for(let i = 0; i < 24; i++){
            for(let j = 0; j < 30; j++){
                ctx.strokeRect(50 + wSize * j, 50 + hSize * i, wSize, hSize);   
            }
        }

        //왼쪽에 계이름 그리기
        ctx.fillStyle = "#fff";
        ctx.font = "18px Arial";
        for(let i = 0; i < 24; i++){
            ctx.fillText(this.codeName[i % 12] + Math.ceil(i / 12), 10, 75 + hSize * i );
        }

        //현재 재생 인덱스 그리기
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(50 + this.playIdx * wSize , 50, wSize, hSize * 24);

        //셀 그리기
        for(let i = 0; i < 24; i++){
            for(let j = 0; j < 30; j++){
                if(this.cellData[i][j]){ //체크 되어 있다면.
                    ctx.fillStyle = this.colorCode[i];
                    ctx.fillRect(54 + wSize * j, 54 + hSize * i, wSize - 8, hSize - 8);
                }
            }
        }
    }

    update(delta){
        this.tempoTime += delta;
        if(this.tempoTime >= this.tempo){
            this.playIdx = (this.playIdx + 1) % 30;
            this.tempoTime = 0;
            this.playSound(); //칸이 바뀔 때 한번 재생
        }
    }

    clickHandle(e){
        const x = e.offsetX;
        const y = e.offsetY;
        let j = Math.floor((x - 50) / this.wSize);
        let i = Math.floor((y - 50) / this.hSize);

        this.cellData[i][j] = !this.cellData[i][j];
    }

    playSound(){
        for(let i = 0; i < 24; i++){
            if(this.cellData[i][this.playIdx]) {
                this.makeSound(i, this.freq[i]);
            }
        }
    }

    makeSound(idx, freq){
        const o = this.oscillator = this.aCtx[idx].createOscillator(); //오실레이터 생성
        o.type = "sine";
        o.frequency.value = freq;
        this.g = this.aCtx[idx].createGain(); //게인노드 가져오고
        o.connect(this.g); //오실레이터를 게인에 연결
        this.g.connect(this.aCtx[idx].destination);
        o.start(); //재생시작
        this.g.gain.exponentialRampToValueAtTime(
            0.00001, this.aCtx[idx].currentTime + 1
        );
    }

    addEvent(){
        let playBtnList = document.querySelectorAll(".note");
        playBtnList.forEach(x => {
            x.addEventListener("click", this.play.bind(this));
        });
    }

}
window.addEventListener("load", ()=>{
    let app = new App();

});