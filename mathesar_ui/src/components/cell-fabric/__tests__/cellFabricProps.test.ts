import { describe, expect, test } from 'vitest';

import DateTimeCell from '../data-types/components/date-time/DateTimeCell.svelte';
import FileCell from '../data-types/components/file/FileCell.svelte';
import NumberCell from '../data-types/components/number/NumberCell.svelte';
import TextAreaCell from '../data-types/components/textarea/TextAreaCell.svelte';
import { getCellFabricComponentProps } from '../cellFabricProps';

const commonProps = {
  canViewLinkedEntities: true,
  columnFabric: { id: '1' },
  disabled: false,
  fileManifest: { name: 'receipt.pdf' },
  fileRequestParams: { token: 'abc' },
  formatter: () => 'formatted',
  formatterOptions: {},
  formatForDisplay: String,
  formattingString: 'DD/MM/YYYY',
  horizontalAlignment: 'left',
  isActive: false,
  isIndependentOfSheet: false,
  isProcessing: false,
  joinedRecordSummariesMap: new Map(),
  length: 120,
  recordSummary: 'Summary',
  searchValue: 'needle',
  setFileManifest: () => undefined,
  setRecordSummary: () => undefined,
  setValue: () => undefined,
  showTruncationPopover: false,
  timeEnableSeconds: false,
  timeShow24Hr: true,
  type: 'date',
  value: 'value',
};

describe('getCellFabricComponentProps', () => {
  test('keeps only props exported by standard scalar cells', () => {
    expect(getCellFabricComponentProps(DateTimeCell, commonProps)).toEqual({
      disabled: false,
      formatForDisplay: String,
      formatter: commonProps.formatter,
      formattingString: 'DD/MM/YYYY',
      isActive: false,
      isIndependentOfSheet: false,
      setValue: commonProps.setValue,
      showTruncationPopover: false,
      timeEnableSeconds: false,
      timeShow24Hr: true,
      type: 'date',
      value: 'value',
    });

    expect(getCellFabricComponentProps(NumberCell, commonProps)).toEqual({
      disabled: false,
      formatForDisplay: String,
      formatterOptions: {},
      horizontalAlignment: 'left',
      isActive: false,
      isIndependentOfSheet: false,
      searchValue: 'needle',
      setValue: commonProps.setValue,
      showTruncationPopover: false,
      value: 'value',
    });

    expect(getCellFabricComponentProps(TextAreaCell, commonProps)).toEqual({
      disabled: false,
      isActive: false,
      isIndependentOfSheet: false,
      length: 120,
      searchValue: 'needle',
      setValue: commonProps.setValue,
      showTruncationPopover: false,
      value: 'value',
    });
  });

  test('keeps file-specific props for file cells', () => {
    expect(getCellFabricComponentProps(FileCell, commonProps)).toEqual({
      disabled: false,
      fileManifest: { name: 'receipt.pdf' },
      fileRequestParams: { token: 'abc' },
      isActive: false,
      isIndependentOfSheet: false,
      setFileManifest: commonProps.setFileManifest,
      setValue: commonProps.setValue,
      value: 'value',
    });
  });

  test('falls back to props signature when Vite wraps component names', () => {
    function ProxyComponent() {}

    expect(getCellFabricComponentProps(ProxyComponent, commonProps)).toEqual({
      disabled: false,
      formatForDisplay: String,
      formatter: commonProps.formatter,
      formattingString: 'DD/MM/YYYY',
      isActive: false,
      isIndependentOfSheet: false,
      setValue: commonProps.setValue,
      showTruncationPopover: false,
      timeEnableSeconds: false,
      timeShow24Hr: true,
      type: 'date',
      value: 'value',
    });
  });
});
