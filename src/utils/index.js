import _ from "lodash";

export function getInfoData({ fields = [], obj }) {
  return _.pick(obj, fields);
}
