const fileInput = document.getElementById("fileInput");
const pages = document.getElementById("pages");
const count = document.getElementById("count");
const clearBtn = document.getElementById("clearBtn");
const printBtn = document.getElementById("printBtn");

let photos = [];

// ドラッグ中の写真のインデックス
let draggedIndex = null;


// ========================================
// 写真の圧縮設定
// ========================================

// 写真の長辺を最大1800pxにする
const MAX_IMAGE_SIZE = 1800;

// JPEGの品質
// 0.0 ～ 1.0
const JPEG_QUALITY = 0.8;


// ========================================
// 写真を追加
// ========================================

fileInput.addEventListener("change", async (e) => {

  const files = [...e.target.files]
    .filter(f => f.type.startsWith("image/"));

  const loaded = await Promise.all(
    files.map(fileToDataURL)
  );

  photos.push(...loaded);

  render();

  // 同じファイルを再度選択できるようにする
  fileInput.value = "";
});


// ========================================
// ファイルを読み込み、圧縮してDataURLに変換
// ========================================

function fileToDataURL(file) {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = () => {

      const img = new Image();

      img.onload = () => {

        // --------------------------------
        // 元画像のサイズ
        // --------------------------------

        let width = img.naturalWidth;
        let height = img.naturalHeight;


        // --------------------------------
        // 長辺が1800pxを超える場合だけ縮小
        // --------------------------------

        if (
          width > MAX_IMAGE_SIZE ||
          height > MAX_IMAGE_SIZE
        ) {

          if (width >= height) {

            // 横長
            height =
              Math.round(
                height *
                (MAX_IMAGE_SIZE / width)
              );

            width =
              MAX_IMAGE_SIZE;

          } else {

            // 縦長
            width =
              Math.round(
                width *
                (MAX_IMAGE_SIZE / height)
              );

            height =
              MAX_IMAGE_SIZE;
          }
        }


        // --------------------------------
        // Canvasを作成
        // --------------------------------

        const canvas =
          document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;


        // --------------------------------
        // Canvasに画像を描画
        // --------------------------------

        const ctx =
          canvas.getContext("2d");

        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );


        // --------------------------------
        // JPEGとして圧縮
        // --------------------------------

        const compressedDataURL =
          canvas.toDataURL(
            "image/jpeg",
            JPEG_QUALITY
          );


        // --------------------------------
        // 圧縮後の画像を保存
        // --------------------------------

        resolve({

          src: compressedDataURL,

          name: file.name,

          caption: ""

        });
      };


      img.onerror = reject;

      img.src = reader.result;
    };


    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}


// ========================================
// 写真同士を交換
// ========================================

function movePhoto(fromIndex, toIndex) {

  // 範囲外なら何もしない
  if (
    fromIndex < 0 ||
    fromIndex >= photos.length ||
    toIndex < 0 ||
    toIndex >= photos.length
  ) {
    return;
  }

  // 同じ写真なら何もしない
  if (fromIndex === toIndex) {
    return;
  }

  // 2つの写真を交換
  const temp = photos[fromIndex];

  photos[fromIndex] = photos[toIndex];

  photos[toIndex] = temp;

  // 画面を再描画
  render();
}


// ========================================
// 写真を1つ前へ
// ========================================

function movePhotoUp(index) {

  if (index <= 0) {
    return;
  }

  movePhoto(
    index,
    index - 1
  );
}


// ========================================
// 写真を1つ後ろへ
// ========================================

function movePhotoDown(index) {

  if (index >= photos.length - 1) {
    return;
  }

  movePhoto(
    index,
    index + 1
  );
}


// ========================================
// 画面を描画
// ========================================

function render() {

  // 現在の表示を一旦削除
  pages.innerHTML = "";

  // 写真枚数を表示
  count.textContent =
    `写真 ${photos.length}枚`;


  // ======================================
  // 写真がない場合
  // ======================================

  if (photos.length === 0) {

    const msg =
      document.createElement("div");

    msg.style.textAlign = "center";

    msg.style.padding = "50px";

    msg.textContent =
      "「写真を選択」から写真を追加してください。";

    pages.appendChild(msg);

    return;
  }


  // ======================================
  // 4枚ずつページを作成
  // ======================================

  for (
    let start = 0;
    start < photos.length;
    start += 4
  ) {

    const page =
      document.createElement("section");

    page.className = "page";


    const grid =
      document.createElement("div");

    grid.className = "photo-grid";


    // ====================================
    // 1ページにつき4枚
    // ====================================

    const chunk =
      photos.slice(
        start,
        start + 4
      );


    for (let i = 0; i < 4; i++) {

      const card =
        document.createElement("div");

      card.className =
        "photo-card";


      // ==================================
      // 写真が存在する場合
      // ==================================

      if (chunk[i]) {

        // photos配列全体での位置
        const photoIndex =
          start + i;


        // =================================
        // 写真名称入力欄
        // =================================

        const caption =
          document.createElement("input");

        caption.className =
          "photo-name";

        caption.type = "text";

        caption.placeholder =
          "写真の名称・説明を入力";

        caption.value =
          chunk[i].caption;


        caption.addEventListener(
          "input",
          () => {

            photos[photoIndex].caption =
              caption.value;
          }
        );


        // =================================
        // 写真表示部分
        // =================================

        const box =
          document.createElement("div");

        box.className =
          "photo-box";


        const img =
          document.createElement("img");

        img.src =
          chunk[i].src;

        img.alt =
          chunk[i].name;


        // =================================
        // ドラッグ＆ドロップ
        // =================================

        box.draggable = true;


        // ドラッグ開始
        box.addEventListener(
          "dragstart",
          () => {

            draggedIndex =
              photoIndex;

            box.classList.add(
              "dragging"
            );
          }
        );


        // ドラッグ終了
        box.addEventListener(
          "dragend",
          () => {

            draggedIndex = null;

            box.classList.remove(
              "dragging"
            );
          }
        );


        // ドラッグ中に他の写真の上を通過
        box.addEventListener(
          "dragover",
          (e) => {

            e.preventDefault();
          }
        );


        // ドロップ
        box.addEventListener(
          "drop",
          (e) => {

            e.preventDefault();

            if (draggedIndex === null) {
              return;
            }

            const targetIndex =
              photoIndex;

            movePhoto(
              draggedIndex,
              targetIndex
            );
          }
        );


        // =================================
        // 写真番号
        // =================================

        const num =
          document.createElement("span");

        num.className =
          "photo-number";

        num.textContent =
          `${photoIndex + 1}`;


        // =================================
        // 写真を配置
        // =================================

        box.appendChild(img);

        /*
         * 写真番号を表示したい場合
         *
         * box.appendChild(num);
         */


        // =================================
        // スマホ用順番変更ボタン
        // =================================

        const orderButtons =
          document.createElement("div");

        orderButtons.className =
          "mobile-order-buttons";


        // ---------------------------------
        // ↑ボタン
        // ---------------------------------

        const upButton =
          document.createElement("button");

        upButton.type = "button";

        upButton.textContent =
          "↑ 前へ";


        upButton.addEventListener(
          "click",
          () => {

            movePhotoUp(
              photoIndex
            );
          }
        );


        // ---------------------------------
        // ↓ボタン
        // ---------------------------------

        const downButton =
          document.createElement("button");

        downButton.type = "button";

        downButton.textContent =
          "↓ 次へ";


        downButton.addEventListener(
          "click",
          () => {

            movePhotoDown(
              photoIndex
            );
          }
        );


        orderButtons.appendChild(
          upButton
        );

        orderButtons.appendChild(
          downButton
        );


        // =================================
        // 個別削除ボタン
        // =================================

        const deleteBtn =
          document.createElement("button");

        deleteBtn.className =
          "delete-button";

        deleteBtn.type = "button";

        deleteBtn.textContent =
          "削除";


        deleteBtn.addEventListener(
          "click",
          () => {

            if (
              !confirm(
                "この写真を削除しますか？"
              )
            ) {
              return;
            }


            // 写真を1枚削除
            photos.splice(
              photoIndex,
              1
            );


            // 画面を再描画
            render();
          }
        );


        // =================================
        // カードに追加
        // =================================

        card.appendChild(
          caption
        );

        card.appendChild(
          box
        );

        card.appendChild(
          orderButtons
        );

        card.appendChild(
          deleteBtn
        );

      }


      // ==================================
      // 写真がない空の枠
      // ==================================

      else {

        card.classList.add(
          "empty-card"
        );
      }


      grid.appendChild(card);
    }


    page.appendChild(grid);

    pages.appendChild(page);
  }
}


// ========================================
// 全削除
// ========================================

clearBtn.addEventListener(
  "click",
  () => {

    if (
      photos.length &&
      !confirm(
        "すべての写真を削除しますか？"
      )
    ) {
      return;
    }

    photos = [];

    render();
  }
);


// ========================================
// 印刷
// ========================================

printBtn.addEventListener(
  "click",
  () => {

    if (!photos.length) {

      alert(
        "写真を追加してください。"
      );

      return;
    }

    window.print();
  }
);


// ========================================
// 初期表示
// ========================================

render();
