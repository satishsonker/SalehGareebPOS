import { toggleWorkTypeDescriptionSelection } from './WorkTypeSelector';

describe('toggleWorkTypeDescriptionSelection', () => {
  it('adds and removes a description under the matching work type', () => {
    const workTypeList = [{ id: 5, code: 'D', name: 'Design' }];
    const workTypes = [{
      id: 5,
      code: 'D',
      name: 'Design',
      workDescriptions: [{ id: 10, workTypeId: 5, name: 'Neckline' }]
    }];

    const added = toggleWorkTypeDescriptionSelection(workTypes, workTypeList, {
      id: 11,
      workTypeId: 5,
      workTypeCode: 'D',
      name: 'Sleeve'
    });

    expect(added[0].workDescriptions.map(item => item.id)).toEqual([10, 11]);

    const removed = toggleWorkTypeDescriptionSelection(added, workTypeList, {
      id: 11,
      workTypeId: 5,
      workTypeCode: 'D',
      name: 'Sleeve'
    });

    expect(removed[0].workDescriptions.map(item => item.id)).toEqual([10]);
  });
});
