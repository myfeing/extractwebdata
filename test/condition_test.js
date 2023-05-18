//let expect = require('chai').expect;
//let Condition = require('../src/condition');
//let WorkflowRuntime = require('../src/workflowruntime');
//let WorkflowCoreCtrlFlow = require('../src/workflowcorectrlflow');
import {expect} from "chai";
import {Condition, ConditionExpression} from "../src/condition.js";
import {Variable} from "../src/workflowruntime.js";
import {Sequence} from "../src/workflowcorectrlflow.js";

describe('condition tests', ()=>{
    it('should pass this canary test.', ()=>{
        expect(true).to.eql(true);
    });
    let condition, conditionExpr, conditionExpr2, seq, vari, vari2 ;
    beforeEach(()=>{
        vari = new Variable('vari');
        vari2= new Variable('vari2');
        seq = new Sequence(undefined);
        seq.addVariable(vari);
        seq.addVariable(vari2);
        condition = new Condition(seq);
        conditionExpr = new ConditionExpression();
        conditionExpr.variableName = 'vari';
        conditionExpr2 = new ConditionExpression();
        conditionExpr2.variableName = 'vari2';
    });
    afterEach(()=>{
       
    });
    it('should pass the boolean test 1: true == "true", true', function(){
        vari.value = true;
        conditionExpr.operator = '==';
        conditionExpr.value = 'true';
        condition.add(conditionExpr);
        let result = condition.evaluate();
        expect(result).to.eql(true);
    });
    it('should pass the boolean test 2: true == "false", false', function(){
        vari.value = true;
        conditionExpr.operator = '==';
        conditionExpr.value = 'false';
        condition.add(conditionExpr);
        let result = condition.evaluate();
        expect(result).to.eql(false);
    });
    it('should pass the boolean test 3: true != "false", true', function(){
        vari.value = true;
        conditionExpr.operator = '!=';
        conditionExpr.value = 'false';
        condition.add(conditionExpr);
        let result = condition.evaluate();
        expect(result).to.eql(true);
    });
    it('should pass the number test 1: 123 == "0456", false', function(){
        vari.value = 123;
        conditionExpr.operator = '==';
        conditionExpr.value = '0456';
        condition.add(conditionExpr);
        let result = condition.evaluate();
        expect(result).to.eql(false);
    });
    it('should pass the number test 2: 123 != "0456", true', function(){
        vari.value = 123;
        conditionExpr.operator = '!=';
        conditionExpr.value = '0456';
        condition.add(conditionExpr);
        let result = condition.evaluate();
        expect(result).to.eql(true);
    });
    it('should pass the number test 3: 123 > "4.56", true', function(){
        vari.value = 123;
        conditionExpr.operator = '>';
        conditionExpr.value = '4.56';
        condition.add(conditionExpr);
        let result = condition.evaluate();
        expect(result).to.eql(true);
    });
    it('should pass the number test 4: 123 >= "0.456", true', function(){
        vari.value = 123;
        conditionExpr.operator = '>=';
        conditionExpr.value = '0.456';
        condition.add(conditionExpr);
        let result = condition.evaluate();
        expect(result).to.eql(true);
    });
    it('should pass the number test 5: 123 < "456.0", true', function(){
        vari.value = 123;
        conditionExpr.operator = '<';
        conditionExpr.value = '456.0';
        condition.add(conditionExpr);
        let result = condition.evaluate();
        expect(result).to.eql(true);
    });
    it('should pass the number test 6: 123 <= "456.", true', function(){
        vari.value = 123;
        conditionExpr.operator = '<=';
        conditionExpr.value = '456.';
        condition.add(conditionExpr);
        let result = condition.evaluate();
        expect(result).to.eql(true);
    });
    it('should pass the number test 7: 123 <= ".456", no matches found', function(){
        vari.value = 123;
        conditionExpr.operator = '<=';
        conditionExpr.value = '.456';
        condition.add(conditionExpr);
        let func = function() {condition.evaluate();};
        expect(func).to.throw("no matches found, wrong expression.");
    });
    it('should pass the number test 8, throw error: 123 <= "."', function(){
        vari.value = 123;
        conditionExpr.operator = '<=';
        conditionExpr.value = '.';
        condition.add(conditionExpr);
        let func = function() {condition.evaluate();};
        expect(func).to.throw(Error, 'value: ., no matches found, wrong expression.');
    });
    it('should pass the number test 9, throw error no matches found: 123 <= ".456."', function(){
        vari.value = 123;
        conditionExpr.operator = '<=';
        conditionExpr.value = '.456.';
        condition.add(conditionExpr);
        let func = function() {condition.evaluate();};
        expect(func).to.throw(Error, 'no matches found, wrong expression.');
    });
    it('should pass the date test 1, 2022-3-22 >= d(2022-1-3), true', function(){
        vari.value = new Date('2022-3-22');
        conditionExpr.operator = '>=';
        conditionExpr.value = 'D(2022-1-3)';
        condition.add(conditionExpr);
        let result = condition.evaluate();
        expect(result).to.eql(true);
    });
    it('should pass the date test 2 throw error, 2022-3-22 >= 2022-19-3', function(){
        vari.value = new Date('2022-3-22');
        conditionExpr.operator = '>=';
        conditionExpr.value = 'D(2022-19-3)';
        condition.add(conditionExpr);
        let func = function() {condition.evaluate();};
        expect(func).to.throw(Error, 'value 2022-19-3 must be date.');
    });
    it('should pass the string test 1, "abc".includes("D"), false', function(){
        vari.value = 'abc';
        conditionExpr.operator = 'includes';
        conditionExpr.value = '"D"';
        condition.add(conditionExpr);
        let result = condition.evaluate();
        expect(result).to.eql(false);
    });
    it('should pass the string test 2, throw error no matches found: 123 != "#"', function(){
        vari.value = '123';
        conditionExpr.operator = '!=';
        conditionExpr.value = '#';
        condition.add(conditionExpr);
        let func = function() {condition.evaluate();};
        expect(func).to.throw(Error, 'no matches found, wrong expression.');
    });
    it('should pass the variable test 1, "vari" != "vari2", true', function(){
        vari.value = '123';
        vari2.value = 'xcz';
        conditionExpr.operator = '!=';
        conditionExpr.value = 'vari2';
        condition.add(conditionExpr);
        let result = condition.evaluate();
        expect(result).to.eql(true);
    });
    it('should pass the composite expression: 123 >= 456 or "@" !="D", true', function() {
        vari.value = 123;
        vari2.value = '@';
        conditionExpr.operator = '>=';
        conditionExpr.value = '456';
        conditionExpr2.rowOperator = 'or';
        conditionExpr2.operator = '!=';
        conditionExpr2.value = '"D"';
        condition.add(conditionExpr);
        condition.add(conditionExpr2);
        let result = condition.evaluate();
        expect(result).to.eql(true);
    })
});
