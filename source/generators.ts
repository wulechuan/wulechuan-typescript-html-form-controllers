import {
    FormControlCSSClassNamesConfig,

    FormConditionAbstractionType,
    FormConditionValiationContext,

    FormUXState,
    FormControlsUXStateHierarchy,
    FormSingleControlUXStateCore,
    FormSingleNonFieldControlUXState,
    FormSingleFieldControlUXState,
} from './types'

import {
    validateAllConditionsOfSingleFormUnit,
    validateAllConditionsOfSingleFormControl,
} from './shared-methods'





export function createFormUXState<T extends FormControlsUXStateHierarchy>(
    uxStateHierarchy: T
): FormUXState<T> {
    const uxState: FormUXState<T> = {
        core: {
            shouldDisableEntireForm: false,
        },

        uxStateHierarchy,

        formExtraConditions: {
            allAreSatisfied:                               true,
            per:                                           [],
            extraCSSClassNamesWhenAnyConditionUnsatisfied: [],
            validateAllConditions:                         function(
                context: FormConditionValiationContext<T>
            ): void {
                const { uxState } = context

                const { derived, formExtraConditions } = uxState

                const {
                    // allConditionsAreSatisfied,
                    activeErrorMessages,
                    activeCSSClassNames,
                } = validateAllConditionsOfSingleFormUnit(context, formExtraConditions)

                derived.activeErrorMessages = activeErrorMessages
                derived.activeCSSClassNames = activeCSSClassNames
            },
        },

        derived: {
            allRequiredFieldsAreValid:    false,
            shouldShowErrorMessagesIfAny: false,
            activeCSSClassNames:          [],
            activeErrorMessages:          [],
        },
    }

    return uxState
}





function createSingleFormControlUXStateCommonPart(
    initState?: {
        shouldHide?: boolean;
        isDisabled?: boolean;
    }
): FormSingleControlUXStateCore {
    initState = initState || {}

    let shouldHide = false
    let isDisabled = false

    if (!!initState && typeof initState === 'object') {
        if ('shouldHide' in initState) {
            shouldHide = !!initState.shouldHide
        }

        if ('isDisabled' in initState) {
            isDisabled = !!initState.isDisabled
        }
    }



    const uxStateCommonPart: FormSingleControlUXStateCore = {
        core: {
            shouldHide,
            isDisabled,
            hasEverFocused: false,
            hasEverBlurred: false,
        },

        derived: {
            allConditionsAreSatisfied:    false,
            shouldShowErrorMessagesIfAny: false,
            hasEverTouched:               false,
            activeErrorMessages:          [],
            activeCSSClassNames:          [],
        },
    }

    return uxStateCommonPart
}





export function createSingleNonFieldControlUXState(
    conditions?: FormSingleNonFieldControlUXState['conditions'],
    initState?: {
        shouldHide?:          boolean;
        isExplictlyDisabled?: boolean;
        isImplictlyDisabled?: boolean;
    }
): FormSingleNonFieldControlUXState {
    let allAreSatisfied                        = true
    let per:                                           FormConditionAbstractionType[] = []
    let extraCSSClassNamesWhenAnyConditionUnsatisfied: FormControlCSSClassNamesConfig = []

    if (!!conditions && typeof conditions === 'object') {
        if ('allAreSatisfied' in conditions) {
            allAreSatisfied = !!conditions.allAreSatisfied
        }

        if (Array.isArray(conditions.per)) {
            per = conditions.per
        }

        if (Array.isArray(conditions.extraCSSClassNamesWhenAnyConditionUnsatisfied)) {
            extraCSSClassNamesWhenAnyConditionUnsatisfied = conditions.extraCSSClassNamesWhenAnyConditionUnsatisfied
        }
    }


    const uxState: FormSingleNonFieldControlUXState = {
        ...createSingleFormControlUXStateCommonPart(initState),

        conditions: {
            allAreSatisfied,
            per,
            extraCSSClassNamesWhenAnyConditionUnsatisfied,
            validateAllConditions:                         validateAllConditionsOfSingleFormControl,
        },
    }

    return uxState
}





export function createSingleFieldControlUXState(
    conditions?: FormSingleFieldControlUXState['conditions'],
    initState?: {
        shouldHide?:          boolean;
        isExplictlyDisabled?: boolean;
        isImplictlyDisabled?: boolean;
        isReadOnly?:          boolean;
        isRequired?:          boolean;
    }
): FormSingleFieldControlUXState {
    let allAreSatisfied                        = true
    let per:                                           FormConditionAbstractionType[] = []
    let extraCSSClassNamesWhenAnyConditionUnsatisfied: FormControlCSSClassNamesConfig = []

    if (!!conditions && typeof conditions === 'object') {
        if ('allAreSatisfied' in conditions) {
            allAreSatisfied = !!conditions.allAreSatisfied
        }

        if (Array.isArray(conditions.per)) {
            per = conditions.per
        }

        if (Array.isArray(conditions.extraCSSClassNamesWhenAnyConditionUnsatisfied)) {
            extraCSSClassNamesWhenAnyConditionUnsatisfied = conditions.extraCSSClassNamesWhenAnyConditionUnsatisfied
        }
    }



    let isReadOnly = false
    let isRequired = false

    if (!!initState && typeof initState === 'object') {
        if ('isReadOnly' in initState) {
            isReadOnly = !!initState.isReadOnly
        }

        if ('isRequired' in initState) {
            isRequired = !!initState.isRequired
        }
    }

    const uxState: FormSingleFieldControlUXState = {
        ...createSingleFormControlUXStateCommonPart(initState),

        conditions: {
            allAreSatisfied,
            per,
            extraCSSClassNamesWhenAnyConditionUnsatisfied,
            validateAllConditions:                         validateAllConditionsOfSingleFormControl,
        },

        field: {
            isReadOnly,
            isRequired,
            isEmpty:                              true,
            isNotEmptyButContainsOnlyWhitespaces: false,
            valueHasEverChanged:                  false,
        },
    }

    return uxState
}
