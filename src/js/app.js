$(() => {
    //スクロール対象を取得
    const screlm = scrollElm()
    //ページトップへ戻る
    pageTop(screlm)

    //ページ内スクロール
    pageScroll(screlm)

    //初期表示
    init()
    //ボタン押下
    $("#submit_button").on("click", function(e) {
        e.preventDefault()
        e.stopPropagation()
        yearConvert()
        return false
    })
})

//ユーザーエージェントからスクロールを実行する対象を判定
const scrollElm = () => {
    if("scrollingElement" in document) {
        return document.scrollingElement
    }
    if(navigator.userAgent.indexOf("WebKit") != -1) {
        return document.body
    }
    return document.documentElement
}

//ページトップへ戻る
const pageTop = (screlm) => {
    const $returnPageTop = $(".returnPageTop")

    $(window).on("scroll", function() {
        //スクロール距離が400pxより大きければページトップへ戻るボタンを表示
        let currentPos = $(this).scrollTop()
        if (currentPos > 400) {
            $returnPageTop.fadeIn()
        } else {
            $returnPageTop.fadeOut()
        }
    })

    //ページトップへスクロールして戻る
    $returnPageTop.on("click", function() {
        $(screlm).animate({ scrollTop: 0 }, 1000, "easeInOutCirc")
        return false
    })
}

//ページ内スクロール
const pageScroll = (screlm) => {
    const navbarHeight = parseInt($("body").attr("data-offset"))
    if($("#index").length) { //トップページの場合のみ動作
        const $navbar = $("#navbar")
        const speed = 1000
        $navbar.find("a").on("click", function(speed) {
            let href = $(this).attr("href")
            let targetID = ""
            if(/^(\.\/|\/)$|^(#)?$/.test(href)) { //hrefの値が「/」「./」「#」「」の場合
                targetID = "html"
            }
            else if(/^(\.\/|\/)#.+/.test(href)) { //hrefの値が「/#HOGE」「./#HOGE」「#HOGE」の場合
                targetID = href.slice(RegExp.$1.length) //正規表現の後方参照により"(\.\/|\/)"をRegExp.$1に格納、その文字列の長さを削除し、「#HOGE」だけの状態にして渡す
            }
            else {
                targetID = href
            }
            let $target = $(targetID)
//            let position = $target.offset().top - navbarHeight
            let position = $target.offset().top
            $(screlm).animate({ scrollTop:position }, speed, "easeInOutCirc")
            $navbar.find(".navbar-toggle[data-target=\"#navbarList\"]").click() //移動したらハンバーガーを折りたたむ
            return false
        })
    }
    //一般
    $('a[href^="#"]').on("click", function(speed) {
        let href = $(this).attr("href")
        let targetID = href == "#" || href == "" ? "html" : href //リンク先が#か空だったらhtmlに
        let $target = $(targetID)
//        let position = $target.offset().top - navbarHeight
        let position = $target.offset().top
        $(screlm).animate({ scrollTop:position }, speed, "easeInOutCirc")
        return false
    })
}

//初期表示
const init = () => {
    const day = new Date()
    const y = day.getFullYear()
    $("#year").val(y)
    $("#year").attr("placeholder", y)
    yearConvert()
}
//値チェック
const checker = (y) => {
    err = ""
    const originYear = parseInt($("#origin_year").attr("data-zero"))
    if(!y.match(/^\d{4}$/g)) {
        err = "年(西暦)は半角数字4桁で入力してください"
    }
    else {
        if(parseInt(y) < originYear) {
            err = "明治十七年より前の上海アリスです"
        }
    }
    return err
}
//エラーメッセージ表示
const errShow = (msg) => {
    //エラーメッセージ
    let invalidElm = $("#invalid_message")
    if(msg.length === 0) {
        invalidElm.text("")
        invalidElm.css({
            "display": "none"
        })
    }
    else {
        invalidElm.text(msg)
        invalidElm.css({
            "display": "block"
        })
    }
}
//計算
const yearConvert = () => {
    //要素
    let $gensokyo_ki = $("#gensokyo_ki")
    let $gensokyo_nen = $("#gensokyo_nen")
    let $accidentAsylum = $("#accidentAsylum")
    //年
    const y = $("#year").val()
    //チェック
    const msg = checker(y)
    const intY = parseInt(y)
    errShow(msg)
    //エラーがなければ処理
    if(msg.length === 0) {
        //季を計算
        $gensokyo_ki.text(`第 ${calKi(intY, true)} 季`)
        //年を計算
        $gensokyo_nen.text(`${calNen(calKi(intY))}`)
        //大結界異変の年かどうか判定
        if(accidentAsylum(calKi(intY))) {
            $accidentAsylum.css({
                "display": "block"
            })
        }
        else {
            $accidentAsylum.css({
                "display": "none"
            })
        }
    }
    else { //エラーの場合はブランクに
        $gensokyo_ki.text("")
        $gensokyo_nen.text("")
        $accidentAsylum.css({
            "display": "none"
        })
    }
}
//季を計算
//flagがtrueならば漢字変換する
const calKi = (y , flag = false) => {
    const originYear = parseInt($("#origin_year").attr("data-zero"))
    const ki = y - originYear
    if(flag) {
        return numbersToKanji(ki)
    }
    else {
        return ki
    }
}
//年を計算
const calNen = (ki) => {
    const sangetsusei = ["日", "月", "星"]
    const eiki = ["春", "夏", "秋", "冬"]
    const patchouli = ["土", "火", "水", "木", "金"]
    return `${sangetsusei[ki % sangetsusei.length]}と${eiki[ki % eiki.length]}と${patchouli[ki % patchouli.length]}の年`
}
//大結界異変
const accidentAsylum = (ki) => {
    const kanreki = 60
    if(ki % kanreki === 0) { //季を60で割り切れる年は異変の年
        return true
    }
    else {
        return false
    }
}
//数字を漢数字へ
//参考: https://note.kiriukun.com/entry/20181229-numbers-to-chinese-numerals
const numbersToKanji = (num) => {
    if (num === undefined || num === null || num === '') {
        return ''
    }
    if (!(/^-?[0-9]+$/g.test(num))) {
        throw new TypeError('半角数字以外の文字が含まれています。漢数字に変換できませんでした。-> '+ num)
    }
    num = Number(num)
    if (!Number.isSafeInteger(num)) {
        throw new RangeError('数値が '+ Number.MIN_SAFE_INTEGER +' ～ '+ Number.MAX_SAFE_INTEGER +' の範囲外です。漢数字に変換できませんでした。-> '+ num)
    }
    if (num === 0) {
        return '零'
    }
    let ret = ''
    if (num < 0) {
        ret += 'マイナス'
        num *= -1
    }
    const numStr = num + ''
    const kanjiNums = ['','一','二','三','四','五','六','七','八','九']
    const kanjiNames = ['十','百','千','万','億','兆','京','垓','𥝱','穣','溝','澗','正','載','極','恒河沙','阿僧祇','那由他','不可思議','無量大数']
    const exponents = [1,2,3,4,8,12,16,20,24,28,32,36,40,44,48,52,56,60,64,68]
    const exponentsLen = exponents.length
    for (let i = exponentsLen; i >= 0; --i) {
        const bias = Math.pow(10, exponents[i])
        if (num >= bias) {
            const top = Math.floor(num / bias)
            if (top >= 10) {
                ret += numbersToKanji(top)
            } else {
                if (top == 1 && exponents[i] <= 3) {
                    // ※先頭の数字が1、かつ指数が3 (千の位) 以下の場合のみ『一』をつけない
                } else {
                    ret += kanjiNums[top]
                }
            }
            ret += kanjiNames[i]
            num -= top * bias
        }
    }
    ret += kanjiNums[num]
    return ret
}