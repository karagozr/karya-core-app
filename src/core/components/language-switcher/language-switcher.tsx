import SelectBox from 'devextreme-react/select-box';

const languageOptions = [
  { id: 'tr-TR', text: 'TR' },
  // { id: 'en-US', text: 'EN' },
  // { id: 'de-DE', text: 'DE' },
];

export const LanguageSwitcher = () => {


  return (
    <SelectBox
      width={70}
      valueExpr={'id'}
      displayExpr={'text'}
      dataSource={languageOptions}
      value={ 'tr-TR'}
      // onValueChanged={handleValueChanged}
      stylingMode={'outlined'}
      inputAttr={{ 'aria-label': 'Language' }}
    />
  );
};
