//一个异步流式回答的函数 对象是字符串型数据 函数中与for await联动实现异步程序
export async function* fakeStream(text: string){ 
    let i = 0;
    while(i < text.length){
        const step = 1 + Math.floor(Math.random() * 3);//1-3个随机字符数量
        yield text.slice(i, i+step);//
        i += step;
        await new Promise((r) => {setTimeout(r, 30)});//30ms作为异步间隔
    }
}