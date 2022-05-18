

const text = ["a"," b", "c"," d", "e"," f", "g"," h", "i"," j", "k", "l"," m", "n", "o", "p", "q", "r"," s", "t", "u", "v", "w", "x", "y"]
const nfactor= 10
for (let index = 0; index < text.length; index++) {
    for (let j = 1; j < nfactor; j++) {
        if (j * 3 <= text.length) {
            text.splice(j * 3, 0, "test");
        }
    }
}