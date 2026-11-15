import { describe, expect, it } from 'vitest';
import { findPhysicalUtilities } from '@/lib/logical-utilities';

describe('findPhysicalUtilities', () => {
  it('flags a physical margin and leaves a logical padding alone', () => {
    expect(findPhysicalUtilities('<div className="ml-4 ps-2">')).toEqual(['ml-4']);
  });

  it('returns nothing for logical utilities', () => {
    expect(findPhysicalUtilities('text-start ms-2 pe-4 start-0 border-s rounded-s-lg')).toEqual([]);
  });

  it('does not flag words that merely contain a physical prefix', () => {
    expect(findPhysicalUtilities('normal-case html-block border-lime-500 rounded-lg inline-flex')).toEqual([]);
  });

  it('flags every physical family', () => {
    const source = 'mr-1 pl-2 pr-3 left-0 right-0 text-left text-right border-l border-r-2 rounded-l-md rounded-tr';
    expect(findPhysicalUtilities(source)).toEqual([
      'mr-1',
      'pl-2',
      'pr-3',
      'left-0',
      'right-0',
      'text-left',
      'text-right',
      'border-l',
      'border-r-2',
      'rounded-l-md',
      'rounded-tr',
    ]);
  });

  it('sees through variants and negative values', () => {
    expect(findPhysicalUtilities('md:ml-4 hover:left-0 -mr-2 sm:-ml-1')).toEqual(['md:ml-4', 'hover:left-0', '-mr-2', 'sm:-ml-1']);
  });

  it('flags arbitrary values', () => {
    expect(findPhysicalUtilities('pl-[3px] left-1/2')).toEqual(['pl-[3px]', 'left-1/2']);
  });
});
