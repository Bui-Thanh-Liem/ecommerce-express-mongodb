import _ from "lodash";

export function getInfoData({ fields = [], obj }) {
  return _.pick(obj, fields);
}

export function removeVietnameseTones(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function toSlug(str) {
  const noTones = removeVietnameseTones(str);
  return _.kebabCase(noTones);
}

// ['a', 'b'] => [['a', 1], ['b', 1]] => { a: 1, b: 1 }
export function getSelectData(select = []) {
  return Object.fromEntries(select.map((field) => [field, 1]));
}

//
export function getUnSelectData(select = []) {
  return Object.fromEntries(select.map((field) => [field, 0]));
}

export function removeFalsyObj(obj) {
  Object.keys(obj).forEach((k) => {
    if (obj[k] === null || obj[k] === undefined) {
      delete obj[k];
    }
  });

  return obj;
}
