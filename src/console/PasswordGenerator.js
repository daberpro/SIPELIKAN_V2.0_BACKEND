import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10;
function main(){

    process.stdout.write("Sipelikan Password Generator\n");
    process.stdout.write("============================\n");
    process.stdout.write("Enter password : ");
    process.stdin.on('data', (data) => {
        const salt = bcrypt.genSaltSync(SALT_ROUNDS);
        const password = data.toString().trim();
        const encode = bcrypt.hashSync(password,salt);
        console.log(`password encode :  ${encode}`);
        process.stdin.pause(); 
    });

}
main();