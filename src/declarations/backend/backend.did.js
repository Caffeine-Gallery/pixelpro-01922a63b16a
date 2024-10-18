export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Vec(IDL.Nat8), 'err' : IDL.Text });
  return IDL.Service({
    'clearAllImages' : IDL.Func([], [], []),
    'deleteImage' : IDL.Func([IDL.Text], [Result], []),
    'getImage' : IDL.Func([IDL.Text], [Result_1], ['query']),
    'getStorageUsage' : IDL.Func([], [IDL.Nat], ['query']),
    'listImages' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'uploadImage' : IDL.Func([IDL.Text, IDL.Vec(IDL.Nat8)], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
