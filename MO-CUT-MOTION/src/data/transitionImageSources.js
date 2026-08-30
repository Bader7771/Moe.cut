// Provenance stays separate from runtime display data so source URLs and
// licensing notes are not shipped in the production JavaScript bundle.
export const transitionImageSources = [
  ["frame-01", "https://unsplash.com/photos/1S8kWIyisNY", "Giuseppe Argenziano"],
  ["frame-02", "https://unsplash.com/photos/E3nJTkw0MWw", "Karsten Winegeart"],
  ["frame-03", "https://unsplash.com/photos/zG87D_xiAVQ", "Leonardo Iribe"],
  ["frame-04", "https://unsplash.com/photos/RdMefFSheyw", "Kenny"],
  ["frame-05", "https://unsplash.com/photos/NCuElPYwsdY", "Sudhan Chitgopkar"],
  ["frame-06", "https://unsplash.com/photos/PSwUqfsGF4g", "Liana S"],
  ["frame-07", "https://unsplash.com/photos/b9lNdKK-2B8", "Monika Schlarman"],
  ["frame-08", "https://unsplash.com/photos/xI2rnHYHtAQ", "Isaac Quesada"],
  ["frame-09", "https://unsplash.com/photos/f3tWX0XNuhU", "Sebastian Schuster"],
  ["frame-10", "https://unsplash.com/photos/HSFTqNF4Wa0", "Max Langelott"],
  ["frame-11", "https://unsplash.com/photos/a8nEiPpK7uk", "PEAR"],
  ["frame-12", "https://unsplash.com/photos/Tx2PKB3mFtQ", "Andrey Soldatov"],
].map(([id, sourceUrl, creator]) => ({
  id,
  sourceUrl,
  creator,
  license: "Unsplash License — production approved",
}));
