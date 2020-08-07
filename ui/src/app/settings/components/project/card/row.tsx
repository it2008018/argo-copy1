import * as React from 'react';
import {Project} from '../../../../shared/models';
import {GetProp, SetProp} from '../../utils';
import {Banner, BannerIcon, BannerType} from '../banner/banner';
import {ResourceKind, ResourceKindSelector} from '../resource-kind-selector';

export interface FieldData {
    type: FieldTypes;
    name: string;
}

export enum FieldTypes {
    Text = 'text',
    ResourceKindSelector = 'resourceKindSelector',
    Url = 'url'
}

interface CardRowProps<T> {
    fields: FieldData[];
    data: T | FieldValue;
    remove: () => void;
    save: (value: T | FieldValue) => Promise<Project>;
    selected: boolean;
    toggleSelect: () => void;
}

interface CardRowState<T> {
    data: T | FieldValue;
}

export type FieldValue = string | ResourceKind;

export class CardRow<T> extends React.Component<CardRowProps<T>, CardRowState<T>> {
    get changed(): boolean {
        if (this.dataIsFieldValue) {
            return this.state.data !== this.props.data;
        }
        for (const key of Object.keys(this.props.data)) {
            if (GetProp(this.props.data as T, key as keyof T) !== GetProp(this.state.data as T, key as keyof T)) {
                return true;
            }
        }
        return false;
    }
    get disabled(): boolean {
        if (!this.state.data) {
            return true;
        }
        if (Object.keys(this.state.data).length < this.props.fields.length) {
            return true;
        }
        if (this.dataIsFieldValue) {
            return this.state.data === '' || this.state.data === null;
        }
        for (const key of Object.keys(this.state.data)) {
            const cur = GetProp(this.state.data as T, key as keyof T).toString();
            if (cur === '' || cur === null) {
                return true;
            }
        }
        return false;
    }
    get dataIsFieldValue(): boolean {
        return this.isFieldValue(this.state.data);
    }
    get fieldsSetToAll(): string[] {
        if (this.dataIsFieldValue) {
            const field = this.props.fields[0];
            const comp = field.type === FieldTypes.ResourceKindSelector ? 'ANY' : '*';
            return this.state.data.toString() === comp ? [field.name] : [];
        }
        const fields = [];
        for (const key of Object.keys(this.state.data)) {
            if (GetProp(this.state.data as T, key as keyof T).toString() === '*') {
                fields.push(key);
            }
        }
        return fields;
    }
    constructor(props: CardRowProps<T>) {
        super(props);
        this.state = {
            data: this.props.data
        };
        this.save = this.save.bind(this);
    }

    public render() {
        let update = this.dataIsFieldValue
            ? (value: FieldValue, _: keyof T) => {
                  this.setState({data: value as FieldValue});
              }
            : (value: string, field: keyof T) => {
                  const change = {...(this.state.data as T)};
                  SetProp(change, field, value);
                  this.setState({data: change});
              };
        update = update.bind(this);
        const inputs = this.props.fields.map((field, i) => {
            let format;
            const curVal = this.dataIsFieldValue ? this.state.data : GetProp(this.state.data as T, field.name as keyof T);
            switch (field.type) {
                case FieldTypes.ResourceKindSelector:
                    format = <ResourceKindSelector init={curVal as ResourceKind} onChange={value => update(value, field.name as keyof T)} />;
                    break;
                default:
                    format = <input type='text' value={curVal ? curVal.toString() : ''} onChange={e => update(e.target.value, field.name as keyof T)} placeholder={field.name} />;
            }
            return (
                <div key={field.name + '.' + i} className='card__col-input card__col'>
                    {format}
                    {field.type === FieldTypes.Url && (curVal as string) !== '' && (curVal as string) !== null && (curVal as string) !== '*' ? (
                        <a className='card__link-icon' href={curVal as string} target='_blank'>
                            <i className='fas fa-link' />
                        </a>
                    ) : null}
                </div>
            );
        });

        return (
            <div>
                <div className='card__input-container card__row'>
                    <div className='card__col-round-button card__col'>
                        <button
                            className={`project__button project__button-round project__button-remove${this.props.selected ? '--selected' : ''}`}
                            onClick={this.props.toggleSelect}>
                            <i className='fa fa-times' />
                        </button>
                    </div>
                    <div>{inputs}</div>
                    <div className='card__col-button card__col'>
                        <button
                            className={`project__button project__button-${this.props.selected ? 'error' : this.disabled ? 'disabled' : this.changed ? 'save' : 'saved'}`}
                            onClick={() => (this.props.selected ? this.props.remove() : this.disabled ? null : this.save())}>
                            {this.props.selected ? 'CONFIRM' : this.disabled ? 'EMPTY' : this.changed ? 'SAVE' : 'SAVED'}
                        </button>
                    </div>
                </div>
                {this.fieldsSetToAll.length > 0 ? this.allNoticeBanner(this.fieldsSetToAll) : null}
            </div>
        );
    }
    private allNoticeBanner(fields: string[]) {
        let fieldList: string = fields[0] + 's';
        fields.splice(0, 1);
        if (fields.length > 0) {
            const last = fields.pop();
            if (fields.length > 0) {
                for (const field of fields) {
                    fieldList += ', ' + field + 's';
                }
            }
            fieldList += ' and ' + last + 's';
        }

        return <div className='card__row'>{Banner(BannerType.Info, BannerIcon.Info, `Note: all (*) ${fieldList} are set`)}</div>;
    }
    private isFieldValue(value: T | FieldValue): value is FieldValue {
        if ((typeof value as FieldValue) === 'string') {
            return true;
        }
        return false;
    }
    private async save() {
        this.props.save(this.state.data);
    }
}
