import { Component, OnInit } from '@angular/core';
//import { stringify } from 'querystring';

@Component({
  selector: 'app-analizador',
  templateUrl: './analizador.component.html',
  styleUrls: ['./analizador.component.css'],
})
export class AnalizadorComponent implements OnInit {
  public coso = 0;
  public lado: any;
  /*   list_NT: string[] = ['S', 'A', 'B', 'C', 'D', 'E'];
    list_T: string[] = ['a', 'b', 'c', 'd', 'e']; */

  /*   diccionario: { [key: string]: string[][] } = {
      'S': [['A', 'B', 'C', 'D', 'E'], ["a", "b"]],
      'A': [['a', 'b'], ['#']],
      'B': [['b','c'], ['#']],
      'C': [['c','d']],
      'D': [['d','e']],
      'E': [['e','F']],
    }; */

  diccionario: { [key: string]: string[][] } = {
    E: [
      ['E', '+', 'T'],
      ['T', 'E'],
      ['E', 'T'],
    ],
    T: [['T', '*', 'F'], ['F']],
  };

  list_NT: string[] = ['E', 'T', 'F'];
  list_T: string[] = ['+', '*'];

  primeros: { [key: string]: string[] } = {};

  Inicio = 'S'; /*  */

  constructor() {}

  ngOnInit(): void {
    /*this.recorreDiccionario("S");
      /* Se recorre para encontrar los primeros */
    /*this.sacarPrimeros("S");   
      /* Se recorre para encontrar los primeros */

    /*     let primerosS:string[]=this.recorridoProfundidad2('S', [])!;
      
      
          var k = Object.keys(primerosS);
          console.log(k[0]);
      
          console.log('--Primeros--');
          console.log(primerosS); */
    this.eliminarRecursionIzquierda();
    console.log('diccionario');
    console.log(this.diccionario);
    console.log(this.list_NT);
  }

  factorizacion() {
    for (let noTerminal in this.diccionario) {
      for (let lista of this.diccionario[noTerminal]) {
      }
    }
  }

  eliminarRecursionIzquierda() {
    for (let noTerminal in this.diccionario) {
      console.log('---' + noTerminal + '---');
      if (this.tieneRecursionIzquierda(noTerminal)) {
        let listaA: string[][] = [];
        let listaB: string[][] = [];

        /*Se separan los an y bn*/
        for (let vector of this.diccionario[noTerminal]) {
          if (vector[0] === noTerminal) {
            listaA.unshift(vector.slice(1, vector.length));
          } else {
            listaB.unshift(vector);
          }
        }

        /*Se modifica la gramatica */
        this.diccionario[noTerminal] = [];
        this.diccionario[noTerminal + '_P'] = [];

        /*Se agrega a los no terminales */
        this.list_NT.unshift(noTerminal + '_P');

        /*Para el noTerminal */
        for (let v of listaB) {
          let vectorTmp: string[] = v.concat([noTerminal + '_P']);
          this.diccionario[noTerminal].unshift(vectorTmp);
        }
        console.log('-------------------');
        /*Para el noTerminal primo*/
        for (let v of listaA) {
          let vectorTmp: string[] = v.concat([noTerminal + '_P']);
          this.diccionario[noTerminal + '_P'].unshift(vectorTmp);
        }

        /*Se agrega el lambda al noterminal primo*/
        this.diccionario[noTerminal + '_P'].unshift(['#']);
      }
    }
  }

  tieneRecursionIzquierda(noTerminal: string) {
    /*Analizar si el vector esta vacio */

    for (let vector of this.diccionario[noTerminal])
      if (vector[0] === noTerminal) {
        return true;
      }

    return false;
  }

  recorridoProfundidad1() {}

  recorridoProfundidad2(noTerminal: string, listaRecorridos: string[]) {
    /*Si la letra esta en recorridos la ignora */
    if (listaRecorridos.includes(noTerminal)) {
      return;
    }

    /*-----Hace procedimiento para saber los primeros de una letra----- */
    listaRecorridos.unshift(noTerminal);
    let listaPrimerosTmp: string[] = [];

    console.log('---' + noTerminal + '---');

    /*------Recorrer los vectores del no terminal del diccionario----------*/
    for (let vector of this.diccionario[noTerminal]) {
      /*Recorre uno de los vectores del diccionario */
      for (let letra of vector) {
        /*1-Si el primero es un terminal se agrega, se sale del ciclo */
        if (this.list_T.includes(letra)) {
          listaPrimerosTmp = this.unionListas(listaPrimerosTmp, [letra]);
          break;
        }
        /*2-Si el primero es un lambda se agrega, se sale del ciclo*/
        if (letra === '#') {
          listaPrimerosTmp.unshift(letra);
          break;
        }

        /*3-Si es un no terminal se juntan con los primeros del terminal*/
        /*Si tiene un lambda se sigue el ciclo, si no se termina el ciclo*/
        if (this.list_NT.includes(letra)) {
          let primerosTmp: string[] = this.recorridoProfundidad2(
            letra,
            listaRecorridos
          )!;
          listaPrimerosTmp = this.unionListas(listaPrimerosTmp, primerosTmp);
        }

        /*4-Si es el ultimo y el proceso sigue, se agrega un lambda */
      }
    }

    return listaPrimerosTmp;
  }

  unionListas(lista1: string[], lista2: string[]) {
    return lista1.concat(lista2.filter((item) => lista1.indexOf(item) < 0));
  }

  /*   diccionario: { [key: string]: string[][] } = {
        S: [['A', 'B', 'C', 'D', 'E']],
        A: [['a'],['#']],
        B: [['b'], ['#']],
        C: [['c']],
        D: [['d']],
        E: [['e']],
      } */

  /*   recorridoProfundidad(noTerminal:string){
        let pila: string[] = [];
        let vectorTmp=[];
        let valorTmp: any;
    
    
    
        pila.unshift(noTerminal)
    
        while(pila.length!=0){
            valorTmp=pila.shift();
            console.log(valorTmp)
    
            let primero:boolean=false;
            let contador:number=0;
            vectorTmp=this.diccionario[valorTmp]
    
    
            
           console.log(vectorTmp)
        }
      } */

  /*   recorreDiccionario(inicio: string) { */
  /*     let cola = [];
        let profundidad=[];
        let temp: any;
    
        cola.push(inicio);
        profundidad.push(inicio);
    
    
        while (cola.length != 0) {
          temp = cola.pop();
     */
  /* Se analizan los datos de la llave primera en la cola 
    S:
    */
  /*       for (let k of this.diccionario[temp]) { */
  /* Analizamos los valores de esa llave */

  /*Revisamos si un valor esta en los noterminales*/
  /*S: ['A', 'B', 'c', 'D', 'e']  solo entran A,B,C*/
  /*         if(this.list_NT.includes(k)){ */
  /*Se agrega cada valor en la cola */
  /*           cola.push(k);
              profundidad.push(k);
            }
          }
        }
        console.log(profundidad)
    
      } */

  guardar() {
    this.coso = this.lado;
    console.log(this.coso);
  }
}
