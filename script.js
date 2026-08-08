const fileInput = document.getElementById("fileInput");
const pages = document.getElementById("pages");
const count = document.getElementById("count");
const clearBtn = document.getElementById("clearBtn");
const printBtn = document.getElementById("printBtn");

let photos = [];

// ドラッグ中の写真のインデックス
let draggedIndex = null;


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
// ファイルをDataURLに変換
// ========================================

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = () => {
      resolve({
        src: reader.result,
        name: file.name,
        caption: ""
      });
    };

    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}


// ========================================
// 写真同士を交換
// ========================================

function movePhoto(fromIndex, toIndex) {

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
// 画面を描画
// ========================================

function render() {

  // 現在の表示を一旦削除
  pages.innerHTML = "";

  // 写真枚数を表示
  count.textContent = `写真 ${photos.length}枚`;


  // 写真がない場合
  if (photos.length === 0) {

    const msg = document.createElement("div");

    msg.style.textAlign = "center";
    msg.style.padding = "50px";

    msg.textContent =
      "「写真を選択」から写真を追加してください。";

    pages.appendChild(msg);

    return;
  }


  // ========================================
  // 4枚ずつページを作成
  // ========================================

  for (
    let start = 0;
    start < photos.length;
    start += 4
  ) {

    const page = document.createElement("section");

    page.className = "page";


    const grid = document.createElement("div");

    grid.className = "photo-grid";


    // ======================================
    // 1ページにつき4枚
    // ======================================

    const chunk = photos.slice(start, start + 4);


    for (let i = 0; i < 4; i++) {

      const card = document.createElement("div");

      card.className = "photo-card";


      // ====================================
      // 写真が存在する場合
      // ====================================

      if (chunk[i]) {

        // photos配列全体での位置
        const photoIndex = start + i;


        // ==================================
        // 写真名称入力欄
        // ==================================

        const caption = document.createElement("input");

        caption.className = "photo-name";

        caption.type = "text";

        caption.placeholder =
          "写真の名称・説明を入力";

        caption.value = chunk[i].caption;


        caption.addEventListener("input", () => {

          chunk[i].caption = caption.value;

        });


        // ==================================
        // 写真表示部分
        // ==================================

        const box = document.createElement("div");

        box.className = "photo-box";


        const img = document.createElement("img");

        img.src = chunk[i].src;

        img.alt = chunk[i].name;


        // ==================================
        // ドラッグ＆ドロップ
        // 写真部分だけをドラッグ可能にする
        // ==================================

        box.draggable = true;


        // ドラッグ開始
        box.addEventListener("dragstart", () => {

          draggedIndex = photoIndex;

          box.classList.add("dragging");

        });


        // ドラッグ終了
        box.addEventListener("dragend", () => {

          draggedIndex = null;

          box.classList.remove("dragging");

        });


        // ドラッグ中に他の写真の上を通過
        box.addEventListener("dragover", (e) => {

          e.preventDefault();

        });


        // ドロップ
        box.addEventListener("drop", (e) => {

          e.preventDefault();

          if (draggedIndex === null) {
            return;
          }

          const targetIndex = photoIndex;

          movePhoto(
            draggedIndex,
            targetIndex
          );

        });


        // ==================================
        // 写真番号
        // ==================================

        const num = document.createElement("span");

        num.className = "photo-number";

        num.textContent =
          `${photoIndex + 1}`;


        // ==================================
        // 写真を配置
        // ==================================

        box.appendChild(img);

        // 写真番号を表示したい場合
        // box.appendChild(num);


        // ==================================
        // 個別削除ボタン
        // ==================================

        const deleteBtn =
          document.createElement("button");

        deleteBtn.className =
          "delete-button";

        deleteBtn.type = "button";

        deleteBtn.textContent = "削除";


        deleteBtn.addEventListener("click", () => {

          if (
            !confirm(
              "この写真を削除しますか？"
            )
          ) {
            return;
          }


          // 写真を1枚削除
          photos.splice(photoIndex, 1);


          // 画面を再描画
          render();

        });


        // ==================================
        // カードに追加
        // ==================================

        card.appendChild(caption);

        card.appendChild(box);

        card.appendChild(deleteBtn);

      }

      // ====================================
      // 写真がない空の枠
      // ====================================

      else {

        card.classList.add("empty-card");

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

clearBtn.addEventListener("click", () => {

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

});


// ========================================
// 印刷
// ========================================

printBtn.addEventListener("click", () => {

  if (!photos.length) {

    alert("写真を追加してください。");

    return;
  }


  window.print();

});


// ========================================
// 初期表示
// ========================================

render();