import * as readline from 'readline';
class Terminal {
    /**
     * 要求用户输入一个准确的答案。当答案匹配时，返回true；否则返回false。
     * @param message 额外提供的信息，用作答案提示词。
     * @param validator 用于判断回答是否正确的函数（可以是异步函数），或字符串。
     * @returns Promise<boolean> 返回一个Promise，表示用户是否确认。
     */

    constructor() {}

    confirm(
        message: string,
        validator: string | ((answer: string) => boolean | Promise<boolean>)
    ): Promise<boolean> {
        return new Promise(resolve => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            rl.question(message, async answer => {
                rl.close();
                if (typeof validator === 'string') {
                    resolve(answer.trim().toLowerCase() === validator.trim().toLowerCase());
                } else if (typeof validator === 'function') {
                    resolve(await validator(answer));
                } else {
                    resolve(false);
                }
            });
        });
    }
    /**
     * 要求用户输入一个字符串。
     * @param message 提示用户输入的消息。
     * @returns Promise<string> 返回一个Promise，包含用户输入的字符串。
     */
    input(message: string): Promise<string> {
        return new Promise(resolve => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            rl.question(message, answer => {
                rl.close();
                resolve(answer);
            });
        });
    }

    /**
     * 要求用户从若干个选项中做出选择。
     * @param choices 可选择的选项数组。
     * @param message 提示用户选择的消息。
     * @return Promise<{ index: number; value: string }> 返回一个Promise，包含用户选择的索引和对应的值。
     * 注意，索引值从0开始，而自动显示的索引从1开始。
     */
    choose(choices: string[], message: string): Promise<{ index: number; value: string }> {
        console.log(message);
        choices.forEach((choice, index) => {
            console.log(`${index + 1}. ${choice}`);
        });
        return new Promise(resolve => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            rl.question('请输入选项编号（按回车提交）', answer => {
                rl.close();
                const index = parseInt(answer.trim(), 10) - 1;
                if (index >= 0 && index < choices.length) {
                    resolve({ index, value: choices[index] });
                } else {
                    resolve({ index: -1, value: '' });
                }
            });
        });
    }
}
export const terminal = new Terminal();
