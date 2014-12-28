
/* PasswordGenerator */
function PasswordGenerator(input_str) {
    digest = b64_sha256(input_str);
    size = 32;
    return {
        digest: digest,
        size: size
    };
}

/* PasswordReq */
function PasswordReq(dict, num, pos) {
    this.dict = dict;
    this.num = parseInt(num);
    this.pos = [];

    for (var i = 0; i < pos.length; i++)
        this.pos.push(parseInt(pos[i]));
}

/* PasswordTransformer */
var char_lower = "abcdefghijklmnopqrstuvwxyz"
var char_upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
var char_digit = "0123456789"
var char_punct = "/+"

var char_dict = {
    lower : char_lower,
    upper : char_upper,
    digit : char_digit,
    punct : char_punct
}

function char_dict_inv(chr) {
    for (var i in char_dict) {
        if (char_dict[i].contains(chr))
            return i;
    }

    throw "not a valid character";
}

function transform_char(old_chr, out_dict) {
    var in_dict, in_len, out_len, c_index, new_chr;

    in_dict = char_dict_inv(old_chr);
    in_len = char_dict[in_dict].length;

    out_len = char_dict[out_dict].length;

    c_index = char_dict[in_dict].indexOf(old_chr);
    c_index = c_index % out_len;

    new_chr = char_dict[out_dict].charAt(c_index);

    return new_chr;
}

function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substr(0, index) + chr + str.substr(index + 1);
}

function check_pauth(input_str, pauth) {
    if (!pauth)
        return input_str;

    var str_pauth = "";

    for (var i = 0; i < pauth.length; i++) {
        var str_dict = char_dict[pauth[i]];
        str_pauth = str_pauth.concat(str_dict)
    }

    for (var i = 0; i < input_str.length; i++) {
        var c = input_str[i];
        if (!str_pauth.contains(c)) {
            c = transform_char(c, pauth[0]);
            input_str = setCharAt(input_str, i, c);
        }
    }

    return input_str;
}

function check_preq(input_str, preq) {
    if (!preq)
        return input_str;

    /* create a list requirements */
    var list_preq = [];
    for (var i = 0; i < preq.length; i++) {
        var a = preq[i].split(':');
        var pr = new PasswordReq(a[0], a[1], a.slice(2));
        list_preq.push(pr);
    }

    /* first pass: ensure position requirements */
    for (var i = 0; i < list_preq.length; i++) {
        var r = list_preq[i];
        for (var j = 0; j < r.pos.length; j++) {
            var p = r.pos[j];
            var c = input_str[p];
            c = transform_char(c, r.dict);
            input_str = setCharAt(input_str, p, c);
        }
    }

    /* second pass: count the occurence of each char class */
    var occurences = {
        lower : [],
        upper : [],
        digit : [],
        punct : [],
    };

    for (var i = 0; i < input_str.length; i++) {
        var c = input_str[i];
        var in_dict = char_dict_inv(c);
        occurences[in_dict].push(i);
    }

    /* third pass: remove required chars from occurences */
    for (var i = 0; i < list_preq.length; i++) {
        var r = list_preq[i];
        for (var j = 0; j < r.pos.length; j++) {
            var p = r.pos[j];
            var index_p = occurences[r.dict].indexOf(p);
            occurences[r.dict].splice(index_p, 1);
            r.num -= 1;
        }
        if (r.num > 0 && occurences[r.dict].length) {
            while (r.num > 0 && occurences[r.dict].length > 0) {
                occurences[r.dict].pop();
                r.num -= 1;
            }
        }
    }

    /* compute the list of changeable indexes */
    var chg_indexes = [];
    for (var o in occurences) {
        chg_indexes = chg_indexes.concat(occurences[o]);
    }
    chg_indexes.sort();

    /* fourth pass: satisfy the requirements (in order of their appearance) */
    for (var i = 0; i < list_preq.length; i++) {
        var r = list_preq[i];
        while (r.num > occurences[r.dict].length) {
            var j = chg_indexes.splice(0, 1);
            var c = input_str[j];
            c = transform_char(c, r.dict);
            input_str = setCharAt(input_str, j, c);
            r.num -= 1;
        }
    }

    return input_str;
}

function clip(input_str, length) {
    if (!length)
        return input_str;

    if (input_str.length < parseInt(length))
        throw "size of generated password is not sufficient"

    return input_str.slice(0, parseInt(length));
}

function patch_str() {
    /* because some browsers don't support String.contains() yet, we patch it
     * with an equivalent */
    if (!String.prototype.contains) {
        String.prototype.contains = function(s, i) {
            return this.indexOf(s, i) != -1;
        }
    }
}

function generate(input_str, length, pauth, preq) {
    patch_str();

    var pwd = PasswordGenerator(input_str);

    var digest;

    digest = clip(pwd.digest, length)
    digest = check_pauth(digest, pauth);
    digest = check_preq(digest, preq);

    return digest;
}
