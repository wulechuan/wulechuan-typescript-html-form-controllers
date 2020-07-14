import {
    FormControlCSSClassNamesConfig,
    FormSingleMessage,
    MethodAbstractionTypeForValidatingAllConditionsOfSingleUnit,
    FormAllConditionsAbstractionTypeOfSingleUnit,
    // FormControlsUXStateHierarchy,

    // FormSingleConditionValiationContext,
    FormNonFieldControlSingleConditionValiationContext,
    FormFieldControlSingleConditionValiationContext,

    FormSingleNonFieldControlUXState,
    FormSingleFieldControlUXState,
} from './types'





export function validateAllConditionsOfSingleFormUnit(
    context:    any, // 此处是公共逻辑，并不关心 context 的细节。况且也不便要求程序员在此说明 context 的细节。
    conditions: FormAllConditionsAbstractionTypeOfSingleUnit
): {
    allConditionsAreSatisfied: boolean;
    activeErrorMessages:       FormSingleMessage[];
    activeCSSClassNames:       FormControlCSSClassNamesConfig;
} {
    const activeErrorMessages: FormSingleMessage[]            = []
    let   activeCSSClassNames: FormControlCSSClassNamesConfig = []

    const allConditionsAreSatisfied = conditions.per.every(condition => {
        const { validator } = condition

        if (typeof validator === 'function') {
            const isSatisfied = validator(context)
            condition.isSatisfied = isSatisfied
            if (!isSatisfied) {
                const {
                    cssClassNamesWhenUnsatisfied,
                    messageWhenUnsatisfied,
                } = condition

                if (messageWhenUnsatisfied) {
                    activeErrorMessages.push(messageWhenUnsatisfied)
                }

                if (cssClassNamesWhenUnsatisfied) {
                    activeCSSClassNames = [
                        ...activeCSSClassNames,
                        ...cssClassNamesWhenUnsatisfied,
                    ]
                }
            }
        }

        return condition.isSatisfied
    })

    if (!allConditionsAreSatisfied) {
        activeCSSClassNames = [
            ...activeCSSClassNames,
            ...conditions.extraCSSClassNamesWhenAnyConditionUnsatisfied,
        ]
    }


    return {
        allConditionsAreSatisfied,
        activeErrorMessages,
        activeCSSClassNames,
    }
}





export const validateAllConditionsOfSingleFormControl: MethodAbstractionTypeForValidatingAllConditionsOfSingleUnit = (
    context: FormNonFieldControlSingleConditionValiationContext | FormFieldControlSingleConditionValiationContext
): void => {
    const { uxState } = context

    const { conditions, derived } = uxState

    const {
        // allConditionsAreSatisfied,
        activeErrorMessages,
        activeCSSClassNames,
    } = validateAllConditionsOfSingleFormUnit(context, conditions)

    derived.activeErrorMessages = activeErrorMessages
    derived.activeCSSClassNames = activeCSSClassNames
}





export function singleNonFieldControlUpdateDerivedStatesTheDefaultWay(
    uxState: FormSingleNonFieldControlUXState
): void {
    const { core, derived } = uxState

    const {
        shouldHide,
        isDisabled,
        hasEverBlurred,
        // hasEverFocused,
    } = core

    const _isDisabled = isDisabled || shouldHide

    derived.isDisabled = _isDisabled
    derived.hasEverTouched = hasEverBlurred
    derived.shouldShowErrorMessagesIfAny = !_isDisabled && hasEverBlurred
}





export function singleFieldControlUpdateDerivedStatesTheDefaultWay(
    uxState: FormSingleFieldControlUXState
): void {
    const { core, derived, field } = uxState

    const {
        shouldHide,
        isDisabled,
        hasEverBlurred,
        // hasEverFocused,
    } = core

    const {
        isReadOnly,
        isRequired,
        // isEmpty,
        // isNotEmptyButContainsOnlyWhitespaces,
    } = field

    const _isDisabled = shouldHide || isDisabled

    derived.isDisabled = _isDisabled
    derived.hasEverTouched = hasEverBlurred
    derived.shouldShowErrorMessagesIfAny = !_isDisabled && !isReadOnly && isRequired && hasEverBlurred
}
