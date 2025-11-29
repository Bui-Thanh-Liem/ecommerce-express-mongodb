import _ from "lodash";
import { Types } from "mongoose";

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

//
export function removeFalsyObj(obj) {
  Object.keys(obj).forEach((k) => {
    if (obj[k] === null || obj[k] === undefined) {
      delete obj[k];
    }
  });

  return obj;
}

// { a: { b: 1 } } → { "a.b": 1 } => chỉ cập nhật những phần client đưa lên trong trường hợp data là obj
export function updateNestedObjParser(obj, prefix = "") {
  const final = {};

  for (let key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    // ⛔ Nếu là ObjectId => coi như primitive
    if (value instanceof Types.ObjectId) {
      final[newKey] = value;
      continue;
    }

    // ⛔ Nếu là null => primitive
    if (value === null) {
      final[newKey] = value;
      continue;
    }

    // Nếu là object (nhưng không phải array)
    if (typeof value === "object" && !Array.isArray(value)) {
      Object.assign(final, updateNestedObjParser(value, newKey));
    } else {
      final[newKey] = value;
    }
  }

  return final;
}

export function stringToObjectId(str) {
  return new Types.ObjectId(String(str));
}
