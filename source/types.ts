// export type FormControlCSSClassNamesConfig = ( // 此处放弃了这种复杂的设定。
//     | null
//     | string
//     | Array<string | null>
//     | { [cssClassName: string]: boolean | undefined; }
// );
export type FormControlCSSClassNamesConfig = string[]; // 此处妥协采用数组，是为了便于合并多个 FormControlCSSClassNamesConfig 。

export type FormSingleMessage<_ViewComponentTypicalRootClass = (this: {}) => void> = (
    | null
    | string
    | HTMLElement
    | _ViewComponentTypicalRootClass // 举例： _ViewComponentTypicalRootClass=Vue 或 _ViewComponentTypicalRootClass=ReactDOM
);



export type FormConditionValidatorAbstractionType<
    _ValidationContext = any
> = (validationContext: _ValidationContext) => boolean;

export type MethodAbstractionTypeForValidatingAllConditionsOfSingleUnit< // A unit here means either a form or a form control.
    _ValidationContext = any
> = (validationContext: _ValidationContext) => void;



export type FormConditionAbstractionType<
    _ValidationContext = any
> = {
    validator?:                    FormConditionValidatorAbstractionType<_ValidationContext>;
    isSatisfied:                   boolean;
    messageWhenUnsatisfied?:       FormSingleMessage;
    cssClassNamesWhenUnsatisfied?: FormControlCSSClassNamesConfig;
};

export type FormAllConditionsAbstractionTypeOfSingleUnit<
    _SingleCondition extends FormConditionAbstractionType = FormConditionAbstractionType,
    _ValidationContext = any
> = {
    allAreSatisfied:                               boolean;
    per:                                           _SingleCondition[];
    extraCSSClassNamesWhenAnyConditionUnsatisfied: FormControlCSSClassNamesConfig;
    validateAllConditions:                         MethodAbstractionTypeForValidatingAllConditionsOfSingleUnit<_ValidationContext>;
};





/**
 * ***************************************************************************
 * Form level data types.
 * ***************************************************************************
 */
export type FormControlsUXStateHierarchy = {
    [key: string]: (
        | undefined
        | FormControlsUXStateHierarchy
        | FormSingleNonFieldControlUXState
        | FormSingleFieldControlUXState
    );
};



export type FormConditionValiationContext<
    _UXStateHierarchy extends FormControlsUXStateHierarchy
> = {
    uxState:        FormUXState<_UXStateHierarchy>;
    fullDataOfForm: any;
    extra?: {
        [key: string]: any;
    };
};

export type FormSingleCondition<
    _UXStateHierarchy extends FormControlsUXStateHierarchy
> = FormConditionAbstractionType<
    FormConditionValiationContext<_UXStateHierarchy>
>;

export type FormUXState<
    _UXStateHierarchy extends FormControlsUXStateHierarchy
> = {
    core: {
        shouldDisableEntireForm: boolean;
    };

    uxStateHierarchy: _UXStateHierarchy;

    formExtraConditions: FormAllConditionsAbstractionTypeOfSingleUnit<
        FormSingleCondition<_UXStateHierarchy>,
        FormConditionValiationContext<_UXStateHierarchy>
    >;

    derived: {
        allRequiredFieldsAreValid:    boolean;

        // 有时候有些提示语是所谓“表单级别”的，不特定于某个输入框或按钮。
        shouldShowErrorMessagesIfAny: boolean;
        activeErrorMessages:          FormSingleMessage[];
        activeCSSClassNames:          FormControlCSSClassNamesConfig;

        // 万一程序员还想另行添加属性。
        [state: string]:              any;
    };
};





/**
 * ***************************************************************************
 * Form control level data types.
 *
 * A non-field control typically means a button or an anchor.
 * A field control typically means an input box, a textarea a [contentEditable], etc.
 * ***************************************************************************
 */

export type FormControlConditionValiationContextAbstractionType<_SingleCondition> = {
    uxState:                _SingleCondition;
    fullDataOfBelongedForm: any;
    extra?: {
        [key: string]: any;
    };
};

export type FormControlSingleConditionValidatorAbstractionType<_SingleCondition> = FormConditionValidatorAbstractionType<
    FormControlConditionValiationContextAbstractionType<_SingleCondition>
>;



export type FormSingleControlUXStateCore = {
    core: {
        shouldHide:     boolean;
        isDisabled:     boolean;
        hasEverFocused: boolean;
        hasEverBlurred: boolean;
    };

    derived: {
        hasEverTouched:               boolean; // 即便发出过【聚焦】和【失焦】而数据本身并未更改，也算 touched。

        shouldShowErrorMessagesIfAny: boolean;
        activeErrorMessages:          FormSingleMessage[];
        activeCSSClassNames:          FormControlCSSClassNamesConfig;

        // 万一程序员还想另行添加属性。
        [state: string]:              any;
    };
};





/**
 * A control condition determines some CSS class names and some message.
 * A control condition might also be used to validate a form control:
 *    1) be it a button, the condition disables or enables the button.
 *    2) be it an input field, the condition disables or enables the field, or asserts incorrection of its value.
 */
export type FormNonFieldControlSingleConditionValiationContext = FormControlConditionValiationContextAbstractionType<
    FormSingleNonFieldControlUXState
>;

export type FormFieldControlSingleConditionValiationContext<_ValueType = any> = FormControlConditionValiationContextAbstractionType<
    FormSingleFieldControlUXState
> & {
    fieldValue: _ValueType;
};



export type FormNonFieldControlSingleCondition = FormConditionAbstractionType<
    FormNonFieldControlSingleConditionValiationContext
> & {
    shouldDetermineAvailability?: boolean; // enable or disable
};

export type FormFieldControlSingleCondition<_ValueType = any> = FormConditionAbstractionType<
    FormFieldControlSingleConditionValiationContext<_ValueType>
> & {
    shouldDetermineAvailability?: boolean; // enable or disable
    shouldAssetValueValidity?:    boolean; // value validity
};





// A non-field control typically means a button or an anchor.
export type FormSingleNonFieldControlUXState = FormSingleControlUXStateCore & {
    conditions: FormAllConditionsAbstractionTypeOfSingleUnit<
        FormNonFieldControlSingleCondition,
        FormNonFieldControlSingleConditionValiationContext
    >;
};

// A field control typically means an input box, a textarea a [contentEditable], etc.
export type FormSingleFieldControlUXState<_ValueType = any> = FormSingleControlUXStateCore & {
    conditions: FormAllConditionsAbstractionTypeOfSingleUnit<
        FormFieldControlSingleCondition<_ValueType>,
        FormFieldControlSingleConditionValiationContext
    >;

    field: {
        isRequired:                           boolean;
        isReadOnly:                           boolean;
        isEmpty:                              boolean;
        isNotEmptyButContainsOnlyWhitespaces: boolean;
        valueHasEverChanged:                  boolean; // 即便不借助 UX 改动数据，而是由程序幕后篡改了数据，也应算 changed，但这显然需篡改数据的代码主动更新该状态值。
    };
};
